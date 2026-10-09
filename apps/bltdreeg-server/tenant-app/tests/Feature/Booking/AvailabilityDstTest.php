<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Support\AvailabilityEngine;
use Bltdreeg\Core\Modules\Booking\Support\AvailableSlot;
use Bltdreeg\Core\Modules\Booking\Support\BookingTime;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

afterEach(function () {
    CarbonImmutable::setTestNow();
});

test('slots stay unique, ordered and real across every day of a DST change month', function () {
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-04-01 00:00:00', BookingTime::zone()));

    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 30,
        'booking_gap_minutes' => 0,
        'booking_days_ahead' => 365,
        'booking_min_notice_minutes' => 0,
    ]);
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    // A window covering midnight-adjacent hours on every weekday, because Egypt's
    // DST change happens at midnight.
    foreach (range(0, 6) as $weekday) {
        BarberSchedule::query()->create([
            'tenant_id' => $branch->tenant_id,
            'branch_id' => $branch->id,
            'user_id' => $barber->id,
            'weekday' => $weekday,
            'start_time' => '00:00',
            'end_time' => '06:00',
            'is_active' => true,
        ]);
    }

    $zone = BookingTime::zone();

    foreach (range(20, 30) as $dayOfApril) {
        $date = BookingTime::day(sprintf('2026-04-%02d', $dayOfApril));
        $slots = AvailabilityEngine::day($branch, $barber, $date, 30);

        expect($slots)->not->toBeEmpty("no slots on 2026-04-{$dayOfApril}");

        $stamps = array_map(fn (AvailableSlot $slot): int => $slot->startsAt->getTimestamp(), $slots);

        // No duplicated instants, and strictly increasing.
        expect($stamps)->toBe(array_values(array_unique($stamps)))
            ->and($stamps)->toBe(collect($stamps)->sort()->values()->all());

        foreach ($slots as $slot) {
            // The local wall time must round-trip to the same instant. A nonexistent
            // local time would not, which is how an invented slot would be caught.
            $roundTripped = CarbonImmutable::parse(
                $slot->startsAt->setTimezone($zone)->format('Y-m-d H:i:s'),
                $zone
            );

            expect($roundTripped->getTimestamp())->toBe(
                $slot->startsAt->getTimestamp(),
                'slot '.$slot->startsAt->toIso8601String().' has no real local time'
            );
        }
    }
});
