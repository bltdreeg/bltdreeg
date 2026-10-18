<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Queue\Models\BarberProfile;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\ChairDayAssignment;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

require_once __DIR__.'/helpers.php';

test('lists chairs that have a barber today with their current queue', function () {
    ['branch' => $branch, 'chair' => $chair, 'haircut' => $haircut] = bookableChair();
    Chair::factory()->create(['branch_id' => $branch->id]); // من غير حلاق: مبيظهرش
    joinNow(Customer::factory()->create(), $chair, [$haircut->id])->assertCreated();

    $this->getJson("/api/v1/branches/{$branch->id}/barbers")
        ->assertOk()
        ->assertJsonPath('branch.is_open', true)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.chair_id', $chair->id)
        ->assertJsonPath('data.0.barber.name', 'Karim')
        ->assertJsonPath('data.0.can_join_now', true)
        ->assertJsonPath('data.0.queue.people_in_queue', 1)
        ->assertJsonPath('data.0.queue.expected_wait_minutes', 30);
});

test('a closed branch lists barbers but not join now', function () {
    ['branch' => $branch] = bookableChair(['is_open' => false]);

    $this->getJson("/api/v1/branches/{$branch->id}/barbers")
        ->assertOk()
        ->assertJsonPath('data.0.can_join_now', false);
});

test('hidden branches are not found', function () {
    $branch = Branch::factory()->create(['is_active' => false]);

    $this->getJson("/api/v1/branches/{$branch->id}/barbers")->assertNotFound();
});

test('lists upcoming slots with room left', function () {
    ['branch' => $branch, 'chair' => $chair, 'haircut' => $haircut] = bookableChair();
    $tomorrow = now()->addDay();
    $open = Slot::factory()->startingAt($tomorrow->setTime(9, 0)->toImmutable())->create(['chair_id' => $chair->id, 'capacity' => 2]);
    $full = Slot::factory()->startingAt($tomorrow->setTime(11, 0)->toImmutable())->create(['chair_id' => $chair->id]);
    Slot::factory()->startingAt(now()->subHour()->toImmutable())->create(['chair_id' => $chair->id]);
    Slot::factory()->startingAt(now()->addDays(30)->toImmutable())->create(['chair_id' => $chair->id]);
    bookSlot(Customer::factory()->create(), $full, [$haircut->id])->assertCreated();
    bookSlot(Customer::factory()->create(), $open, [$haircut->id])->assertCreated();

    $this->getJson("/api/v1/branches/{$branch->id}/chairs/{$chair->id}/slots")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $open->id)
        ->assertJsonPath('data.0.remaining', 1)
        ->assertJsonPath('data.0.starts_at', $open->startsAt()->toIso8601String());
});

test('slots of a chair in another branch are not found', function () {
    ['chair' => $chair] = bookableChair();
    $otherBranch = Branch::factory()->create();

    $this->getJson("/api/v1/branches/{$otherBranch->id}/chairs/{$chair->id}/slots")->assertNotFound();
});

test('the day assignment overrides the default barber', function () {
    ['branch' => $branch, 'chair' => $chair] = bookableChair();
    $substitute = BarberProfile::factory()->create(['tenant_id' => $branch->tenant_id, 'name' => 'Hassan']);
    ChairDayAssignment::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'chair_id' => $chair->id,
        'barber_profile_id' => $substitute->id,
        'day' => now(Slot::TIMEZONE)->toDateString(),
    ]);

    $this->getJson("/api/v1/branches/{$branch->id}/barbers")->assertJsonPath('data.0.barber.name', 'Hassan');
});
