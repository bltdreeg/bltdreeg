<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Queue\Enums\ChairStatusEnum;
use Bltdreeg\Core\Modules\Queue\Models\BarberProfile;
use Bltdreeg\Core\Modules\Queue\Models\Reservation;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Queue\Support\QueueEngine;
use Bltdreeg\Core\Modules\Services\Models\BranchService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

require_once __DIR__.'/helpers.php';

test('joining now puts the customer in the chair queue with a price snapshot', function () {
    ['chair' => $chair, 'haircut' => $haircut, 'beard' => $beard] = bookableChair();
    $customer = Customer::factory()->create();

    joinNow($customer, $chair, [$haircut->id, $beard->id])
        ->assertCreated()
        ->assertJsonPath('type', 'join_now')
        ->assertJsonPath('status', 'queued')
        ->assertJsonPath('barber.name', 'Karim')
        ->assertJsonPath('total_price', 160)
        ->assertJsonPath('total_duration_minutes', 50)
        ->assertJsonPath('position.people_ahead', 0)
        ->assertJsonPath('position.is_your_turn', true)
        ->assertJsonCount(2, 'services');

    $haircut->update(['price' => 999]);

    expect(Reservation::query()->firstOrFail()->totalPrice())->toBe(160.0);
});

test('people ahead and expected wait follow join order and the current service', function () {
    ['chair' => $chair, 'haircut' => $haircut, 'beard' => $beard] = bookableChair();
    [$first, $second, $third] = Customer::factory()->count(3)->create();

    joinNow($first, $chair, [$haircut->id])->assertCreated();
    $this->travel(1)->minutes();
    joinNow($second, $chair, [$beard->id])->assertCreated();
    $this->travel(1)->minutes();

    $firstReservation = Reservation::query()->where('customer_id', $first->id)->firstOrFail();
    app(QueueEngine::class)->startService($firstReservation);
    $this->travel(10)->minutes();

    // قدامه: اللي بيتخدم (فاضله 20 من 30) + التاني (20)
    joinNow($third, $chair, [$haircut->id])
        ->assertCreated()
        ->assertJsonPath('position.people_ahead', 2)
        ->assertJsonPath('position.expected_wait_minutes', 40)
        ->assertJsonPath('position.is_your_turn', false);
});

test('a customer can be in only one live queue at a time', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    ['chair' => $otherChair, 'haircut' => $otherHaircut] = bookableChair();
    $customer = Customer::factory()->create();
    $first = joinNow($customer, $chair, [$haircut->id])->json('id');

    joinNow($customer, $otherChair, [$otherHaircut->id])
        ->assertStatus(409)
        ->assertJsonPath('code', 'booking.already_in_queue')
        ->assertJsonPath('data.reservation_id', $first);
});

test('cannot join now when the branch is closed, but can still book a slot', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair(['is_open' => false]);
    $slot = Slot::factory()->create(['chair_id' => $chair->id]);
    $customer = Customer::factory()->create();

    joinNow($customer, $chair, [$haircut->id])
        ->assertStatus(409)
        ->assertJsonPath('code', 'booking.branch_closed');

    bookSlot($customer, $slot, [$haircut->id])
        ->assertCreated()
        ->assertJsonPath('status', 'booked')
        ->assertJsonPath('position', null)
        ->assertJsonPath('slot.id', $slot->id);
});

test('a chair without a barber or that is off cannot take bookings', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    $customer = Customer::factory()->create();
    BarberProfile::query()->withoutGlobalScopes()->update(['is_active' => false]);

    joinNow($customer, $chair, [$haircut->id])->assertStatus(409)->assertJsonPath('code', 'booking.chair_unavailable');

    BarberProfile::query()->withoutGlobalScopes()->update(['is_active' => true]);
    $chair->update(['status' => ChairStatusEnum::Off]);

    joinNow($customer, $chair, [$haircut->id])->assertStatus(409)->assertJsonPath('code', 'booking.chair_unavailable');
});

test('services must belong to the branch salon and not be disabled for the branch', function () {
    ['branch' => $branch, 'chair' => $chair, 'haircut' => $haircut] = bookableChair();
    ['haircut' => $otherSalonService] = bookableChair();
    $customer = Customer::factory()->create();

    joinNow($customer, $chair, [$otherSalonService->id])->assertStatus(422)->assertJsonPath('code', 'booking.invalid_services');

    BranchService::query()->create([
        'tenant_id' => $branch->tenant_id, 'branch_id' => $branch->id, 'service_id' => $haircut->id, 'is_active' => false,
    ]);

    joinNow($customer, $chair, [$haircut->id])->assertStatus(422)->assertJsonPath('code', 'booking.invalid_services');
});

test('branch price overrides are what the customer is charged', function () {
    ['branch' => $branch, 'chair' => $chair, 'haircut' => $haircut] = bookableChair();
    BranchService::query()->create([
        'tenant_id' => $branch->tenant_id, 'branch_id' => $branch->id, 'service_id' => $haircut->id, 'price' => 120, 'duration' => 40,
    ]);

    joinNow(Customer::factory()->create(), $chair, [$haircut->id])
        ->assertCreated()
        ->assertJsonPath('total_price', 120)
        ->assertJsonPath('total_duration_minutes', 40);
});

test('slot rules: capacity, two future slots, no same start time, no double booking', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    ['chair' => $otherChair, 'haircut' => $otherHaircut] = bookableChair();
    $customer = Customer::factory()->create();
    $tomorrow = now()->addDay();

    $slot = Slot::factory()->startingAt($tomorrow->setTime(10, 0)->toImmutable())->create(['chair_id' => $chair->id]);
    $sameTime = Slot::factory()->startingAt($tomorrow->setTime(10, 0)->toImmutable())->create(['chair_id' => $otherChair->id]);
    $later = Slot::factory()->startingAt($tomorrow->setTime(12, 0)->toImmutable())->create(['chair_id' => $chair->id]);
    $evenLater = Slot::factory()->startingAt($tomorrow->setTime(14, 0)->toImmutable())->create(['chair_id' => $chair->id]);

    bookSlot($customer, $slot, [$haircut->id])->assertCreated();
    bookSlot($customer, $slot, [$haircut->id])->assertStatus(409)->assertJsonPath('code', 'booking.slot_already_booked');
    bookSlot($customer, $sameTime, [$otherHaircut->id])->assertStatus(409)->assertJsonPath('code', 'booking.slot_same_time');
    bookSlot($customer, $later, [$haircut->id])->assertCreated();
    bookSlot($customer, $evenLater, [$haircut->id])
        ->assertStatus(409)
        ->assertJsonPath('code', 'booking.slot_limit')
        ->assertJsonPath('message', 'You can hold at most 2 upcoming slots.');

    bookSlot(Customer::factory()->create(), $slot, [$haircut->id])->assertStatus(409)->assertJsonPath('code', 'booking.slot_full');
});

test('a slot that already started cannot be booked', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    $slot = Slot::factory()->startingAt(now()->subMinute()->toImmutable())->create(['chair_id' => $chair->id]);

    bookSlot(Customer::factory()->create(), $slot, [$haircut->id])
        ->assertStatus(409)
        ->assertJsonPath('code', 'booking.slot_unavailable');
});

test('cancelling frees the place and moves people behind up', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    [$first, $second] = Customer::factory()->count(2)->create();
    $firstId = joinNow($first, $chair, [$haircut->id])->json('id');
    $this->travel(1)->minutes();
    $secondId = joinNow($second, $chair, [$haircut->id])->json('id');

    $this->actingAs($first, 'customer')->postJson("/api/v1/reservations/{$firstId}/cancel")
        ->assertOk()
        ->assertJsonPath('status', 'cancelled');

    $this->actingAs($second, 'customer')->getJson("/api/v1/reservations/{$secondId}")
        ->assertOk()
        ->assertJsonPath('position.people_ahead', 0);

    $this->actingAs($first, 'customer')->postJson("/api/v1/reservations/{$firstId}/cancel")
        ->assertStatus(409)
        ->assertJsonPath('code', 'booking.not_cancellable');
});

test('a customer only sees their own reservations', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    $owner = Customer::factory()->create();
    $id = joinNow($owner, $chair, [$haircut->id])->json('id');
    $stranger = Customer::factory()->create();

    $this->actingAs($stranger, 'customer')->getJson("/api/v1/reservations/{$id}")->assertNotFound();
    $this->actingAs($stranger, 'customer')->postJson("/api/v1/reservations/{$id}/cancel")->assertNotFound();
    $this->actingAs($stranger, 'customer')->getJson('/api/v1/reservations')->assertOk()->assertJsonCount(0, 'data');
});

test('my reservations are split into active and past', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    $customer = Customer::factory()->create();
    $slot = Slot::factory()->create(['chair_id' => $chair->id]);
    $cancelled = joinNow($customer, $chair, [$haircut->id])->json('id');
    $this->actingAs($customer, 'customer')->postJson("/api/v1/reservations/{$cancelled}/cancel")->assertOk();
    $live = joinNow($customer, $chair, [$haircut->id])->json('id');
    $booked = bookSlot($customer, $slot, [$haircut->id])->json('id');

    $active = $this->actingAs($customer, 'customer')->getJson('/api/v1/reservations')->assertOk()->json('data');
    $past = $this->actingAs($customer, 'customer')->getJson('/api/v1/reservations?scope=past')->assertOk()->json('data');

    expect(collect($active)->pluck('id')->all())->toBe([$live, $booked])
        ->and(collect($past)->pluck('id')->all())->toBe([$cancelled]);
});

test('booking needs an onboarded customer', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    $guest = Customer::factory()->unverifiedPhone()->create();

    joinNow($guest, $chair, [$haircut->id])->assertForbidden()->assertJsonPath('code', 'auth.onboarding_required');
});

test('booking needs an account', function () {
    $this->postJson('/api/v1/reservations', ['type' => 'join_now'])->assertUnauthorized();
});

test('validates the request shape', function () {
    $customer = Customer::factory()->create();

    $this->actingAs($customer, 'customer')->postJson('/api/v1/reservations', ['type' => 'slot', 'service_ids' => []])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['slot_id', 'service_ids']);
});
