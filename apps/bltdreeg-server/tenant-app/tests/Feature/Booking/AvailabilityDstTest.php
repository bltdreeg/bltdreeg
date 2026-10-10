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

test('slots stay unique, ordered and real across the fall-back week, including the repeated hour', function () {
    // Spring-forward skips an hour at the START of the day (00:00-01:00), which
    // the test above covers with a 00:00-06:00 window. Fall-back REPEATS an hour
    // at the END of the day (verified against PHP's own tzdata: Egypt's 2026
    // fall-back is 2026-10-29 21:00 UTC, local 23:00-23:59 occurring twice) --
    // a window that only covers the start of the day would never exercise it.
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-01 00:00:00', BookingTime::zone()));

    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 30,
        'booking_gap_minutes' => 0,
        'booking_days_ahead' => 365,
        'booking_min_notice_minutes' => 0,
    ]);
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    foreach (range(0, 6) as $weekday) {
        BarberSchedule::query()->create([
            'tenant_id' => $branch->tenant_id,
            'branch_id' => $branch->id,
            'user_id' => $barber->id,
            'weekday' => $weekday,
            'start_time' => '20:00',
            'end_time' => '23:59:59',
            'is_active' => true,
        ]);
    }

    $zone = BookingTime::zone();

    foreach (range(25, 31) as $dayOfOctober) {
        $date = BookingTime::day(sprintf('2026-10-%02d', $dayOfOctober));
        $slots = AvailabilityEngine::day($branch, $barber, $date, 30);

        expect($slots)->not->toBeEmpty("no slots on 2026-10-{$dayOfOctober}");

        $stamps = array_map(fn (AvailableSlot $slot): int => $slot->startsAt->getTimestamp(), $slots);

        // Every slot is a distinct, real instant, in order. Unlike the
        // spring-forward test above, this does NOT round-trip each slot's local
        // label back through parse(): on fall-back day, "23:00" genuinely names
        // two different real instants (one per offset), so re-parsing the naive
        // label is lossy by the nature of ambiguous civil time, not a defect —
        // it always resolves to the later of the two, which is exactly why a
        // write path must key a chosen slot by its full instant (the ISO 8601
        // string with offset, as AvailableSlot::toArray() already returns),
        // never by replaying the naive local-time label.
        expect($stamps)->toBe(array_values(array_unique($stamps)))
            ->and($stamps)->toBe(collect($stamps)->sort()->values()->all());
    }

    // On the fall-back day itself, the repeated hour is offered exactly twice —
    // the known, accepted shape of the output, not silently collapsed to one.
    $fallBackSlots = AvailabilityEngine::day($branch, $barber, BookingTime::day('2026-10-29'), 30);
    $elevenPm = array_values(array_filter(
        $fallBackSlots,
        fn (AvailableSlot $slot): bool => $slot->startsAt->setTimezone($zone)->format('H:i') === '23:00'
    ));

    expect($elevenPm)->toHaveCount(2)
        ->and($elevenPm[0]->startsAt->utcOffset())->not->toBe($elevenPm[1]->startsAt->utcOffset());
});
