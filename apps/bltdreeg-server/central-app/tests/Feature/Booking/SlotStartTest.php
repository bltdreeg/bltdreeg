<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationStatusEnum;
use Bltdreeg\Core\Modules\Queue\Models\Reservation;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Queue\Support\QueueEngine;
use Bltdreeg\Core\Modules\Queue\Support\QueueProjection;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

require_once __DIR__.'/helpers.php';

test('at slot start the holder joins behind everyone already queued', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    [$walkIn, $holder] = Customer::factory()->count(2)->create();
    $slot = Slot::factory()->startingAt(now()->addMinutes(30)->startOfMinute()->toImmutable())->create(['chair_id' => $chair->id]);

    bookSlot($holder, $slot, [$haircut->id])->assertCreated();
    $this->travel(31)->minutes();
    // دخل قبل ما الـ slot يتعالج، بس بعد بدايته: الـ join_time بتاعه بعد بداية الـ slot
    joinNow($walkIn, $chair, [$haircut->id])->assertCreated();

    expect(app(QueueEngine::class)->startDueSlots())->toBe(1);

    $slotReservation = Reservation::query()->where('customer_id', $holder->id)->firstOrFail();
    expect($slotReservation->status)->toBe(ReservationStatusEnum::Queued)
        ->and($slotReservation->join_time->equalTo($slot->startsAt()))->toBeTrue()
        ->and(QueueProjection::forChair($chair)->positionOf($slotReservation)['people_ahead'])->toBe(0);
});

test('reading my reservations starts a due slot even without the scheduler', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    $holder = Customer::factory()->create();
    $slot = Slot::factory()->startingAt(now()->addMinutes(5)->startOfMinute()->toImmutable())->create(['chair_id' => $chair->id]);
    $id = bookSlot($holder, $slot, [$haircut->id])->json('id');

    $this->travel(6)->minutes();

    $this->actingAs($holder, 'customer')->getJson("/api/v1/reservations/{$id}")
        ->assertOk()
        ->assertJsonPath('status', 'queued')
        ->assertJsonPath('position.people_ahead', 0);
});

test('a slot holder already in another live queue loses the slot and keeps the queue', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    ['chair' => $otherChair, 'haircut' => $otherHaircut] = bookableChair();
    $customer = Customer::factory()->create();
    $slot = Slot::factory()->startingAt(now()->addMinutes(10)->startOfMinute()->toImmutable())->create(['chair_id' => $chair->id]);
    bookSlot($customer, $slot, [$haircut->id])->assertCreated();
    $liveId = joinNow($customer, $otherChair, [$otherHaircut->id])->assertCreated()->json('id');

    $this->travel(11)->minutes();
    app(QueueEngine::class)->startDueSlots();

    expect(Reservation::query()->whereNotNull('slot_id')->firstOrFail()->status)->toBe(ReservationStatusEnum::Cancelled)
        ->and(Reservation::query()->findOrFail($liveId)->status)->toBe(ReservationStatusEnum::Queued);
});

test('holders of the same slot keep booking order', function () {
    ['chair' => $chair, 'haircut' => $haircut] = bookableChair();
    [$early, $late] = Customer::factory()->count(2)->create();
    $slot = Slot::factory()->startingAt(now()->addHour()->startOfMinute()->toImmutable())->create(['chair_id' => $chair->id, 'capacity' => 2]);
    bookSlot($early, $slot, [$haircut->id])->assertCreated();
    bookSlot($late, $slot, [$haircut->id])->assertCreated();

    $this->travel(61)->minutes();
    $this->artisan('booking:start-due-slots')->assertSuccessful();

    $projection = QueueProjection::forChair($chair);
    $position = fn (Customer $c) => $projection->positionOf(Reservation::query()->where('customer_id', $c->id)->firstOrFail())['people_ahead'];

    expect($position($early))->toBe(0)->and($position($late))->toBe(1);
});
