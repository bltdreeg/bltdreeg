<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Models\BarberBookingSettings;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Booking\Support\AvailabilityEngine;
use Bltdreeg\Core\Modules\Booking\Support\AvailableSlot;
use Bltdreeg\Core\Modules\Booking\Support\BookingTime;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

/** A fixed Monday well inside the booking horizon, with "now" pinned far before it. */
function bookingDay(): CarbonImmutable
{
    return BookingTime::day('2026-11-02'); // Monday
}

beforeEach(function () {
    // Pinned so min-notice and horizon maths are deterministic.
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-01 09:00:00', BookingTime::zone()));
});

afterEach(function () {
    CarbonImmutable::setTestNow();
});

function branchWithBarber(array $branchAttributes = []): array
{
    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 15,
        'booking_gap_minutes' => 0,
        'booking_days_ahead' => 30,
        'booking_min_notice_minutes' => 60,
        ...$branchAttributes,
    ]);
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    return [$branch, $barber];
}

function window(Branch $branch, User $barber, string $start, string $end, ?int $weekday = null): BarberSchedule
{
    return BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => $weekday ?? (int) bookingDay()->dayOfWeek,
        'start_time' => $start,
        'end_time' => $end,
        'is_active' => true,
    ]);
}

function startTimes(array $slots): array
{
    return array_map(fn (AvailableSlot $slot): string => $slot->startsAt->format('H:i'), $slots);
}

test('slots step by the configured step and fit the basket inside the window', function () {
    [$branch, $barber] = branchWithBarber();
    window($branch, $barber, '10:00', '11:00');

    $slots = AvailabilityEngine::day($branch, $barber, bookingDay(), 30);

    // 10:00, 10:15, 10:30 fit a 30-minute basket before 11:00; 10:45 does not.
    expect(startTimes($slots))->toBe(['10:00', '10:15', '10:30']);
});

test('a basket longer than the window yields nothing', function () {
    [$branch, $barber] = branchWithBarber();
    window($branch, $barber, '10:00', '11:00');

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 90))->toBe([]);
});

test('no schedule means no slots', function () {
    [$branch, $barber] = branchWithBarber();

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 30))->toBe([]);
});

test('a paused barber yields nothing', function () {
    [$branch, $barber] = branchWithBarber();
    window($branch, $barber, '10:00', '14:00');

    BarberBookingSettings::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'is_paused' => true,
    ]);

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 30))->toBe([]);
});

test('split shifts produce two bands with a real gap between them', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '12:00');
    window($branch, $barber, '17:00', '19:00');

    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 60)))
        ->toBe(['10:00', '11:00', '17:00', '18:00']);
});

test('an existing booking removes the slots it overlaps', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 30]);
    window($branch, $barber, '10:00', '12:00');

    $start = bookingDay()->setTime(10, 30);
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes(30),
        'duration_minutes' => 30,
        'gap_minutes' => 0,
    ]);

    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 30)))
        ->toBe(['10:00', '11:00', '11:30']);
});

test('a booking blocks its own stored gap, not the current setting', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 30, 'booking_gap_minutes' => 0]);
    window($branch, $barber, '10:00', '12:00');

    $start = bookingDay()->setTime(10, 0);
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes(30),
        'duration_minutes' => 30,
        'gap_minutes' => 30, // booked when the gap was 30
    ]);

    // 10:30 is eaten by the old gap even though the branch gap is now 0.
    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 30)))
        ->toBe(['11:00', '11:30']);
});

test('a cancelled booking releases its slot', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '12:00');

    $start = bookingDay()->setTime(10, 0);
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes(60),
        'duration_minutes' => 60,
        'status' => BookingStatusEnum::Cancelled,
    ]);

    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 60)))
        ->toBe(['10:00', '11:00']);
});

test('a time block removes the slots it covers', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '14:00');

    BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => bookingDay()->setTime(11, 0)->utc(),
        'ends_at' => bookingDay()->setTime(13, 0)->utc(),
        'is_full_day' => false,
    ]);

    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 60)))
        ->toBe(['10:00', '13:00']);
});

test('a full-day block clears the day', function () {
    [$branch, $barber] = branchWithBarber();
    window($branch, $barber, '10:00', '14:00');

    BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => bookingDay()->startOfDay()->utc(),
        'ends_at' => bookingDay()->endOfDay()->utc(),
        'is_full_day' => true,
    ]);

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 30))->toBe([]);
});

test('minimum notice hides slots too close to now', function () {
    [$branch, $barber] = branchWithBarber(['booking_min_notice_minutes' => 120, 'booking_slot_step_minutes' => 60]);
    $today = BookingTime::day('2026-11-01');
    window($branch, $barber, '09:00', '14:00', (int) $today->dayOfWeek);

    // now is 09:00; 120 minutes' notice means the first bookable start is 11:00.
    expect(startTimes(AvailabilityEngine::day($branch, $barber, $today, 60)))
        ->toBe(['11:00', '12:00', '13:00']);
});

test('a date beyond the horizon yields nothing', function () {
    [$branch, $barber] = branchWithBarber(['booking_days_ahead' => 3]);
    $far = BookingTime::day('2026-12-01');
    window($branch, $barber, '10:00', '14:00', (int) $far->dayOfWeek);

    expect(AvailabilityEngine::day($branch, $barber, $far, 30))->toBe([]);
});

test('a past date yields nothing', function () {
    [$branch, $barber] = branchWithBarber();
    $past = BookingTime::day('2026-10-01');
    window($branch, $barber, '10:00', '14:00', (int) $past->dayOfWeek);

    expect(AvailabilityEngine::day($branch, $barber, $past, 30))->toBe([]);
});

test('each slot carries the queue position it would take', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '13:00');

    $start = bookingDay()->setTime(10, 0);
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes(60),
        'duration_minutes' => 60,
    ]);

    $slots = AvailabilityEngine::day($branch, $barber, bookingDay(), 60);

    // Spec §5.3: preview counts non-cancelled bookings with an earlier starts_at,
    // plus one. Only the 10:00 booking is real, so both later slots rank 2 — the
    // preview never treats an unbooked, merely-available earlier slot as "ahead".
    expect(startTimes($slots))->toBe(['11:00', '12:00'])
        ->and($slots[0]->queueNumberPreview)->toBe(2)
        ->and($slots[1]->queueNumberPreview)->toBe(2);
});

test('isBookable agrees with the day grid', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '12:00');

    expect(AvailabilityEngine::isBookable($branch, $barber, bookingDay()->setTime(10, 0), 60))->toBeTrue()
        ->and(AvailabilityEngine::isBookable($branch, $barber, bookingDay()->setTime(10, 30), 60))->toBeFalse()
        ->and(AvailabilityEngine::isBookable($branch, $barber, bookingDay()->setTime(15, 0), 60))->toBeFalse();
});

test('a booking in the repeated DST fall-back hour is still visible to the day query', function () {
    // Egypt's 2026 fall-back (verified against PHP's own tzdata transitions) is at
    // 2026-10-29 21:00 UTC: local 23:00-23:59 occurs twice that day, once at
    // +03:00 (DST) and once at +02:00 (standard time). A plain parse of the naive
    // string "23:00:00" resolves to the SECOND, later occurrence (21:00 UTC) --
    // which the OLD endOfDay()-bounded range (20:59:59 UTC) would have excluded
    // entirely, making a booking there invisible to occupancy and the lock.
    [$branch, $barber] = branchWithBarber();
    $fallBackDay = BookingTime::day('2026-10-29');
    $secondOccurrence = CarbonImmutable::parse('2026-10-29 23:00:00', BookingTime::zone());

    expect($secondOccurrence->utc()->format('H:i'))->toBe('21:00'); // sanity-check the premise

    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $secondOccurrence,
        'ends_at' => $secondOccurrence->addMinutes(30),
        'duration_minutes' => 30,
    ]);

    expect(Booking::query()->withoutGlobalScopes()->forBarberOn($barber->id, $fallBackDay)->count())->toBe(1);
});

test('a zero slot step yields no slots instead of hanging', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 0]);
    window($branch, $barber, '10:00', '14:00');

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 30))->toBe([]);
});

test('creating a booking invalidates the next day\'s cache, not the previous day\'s', function () {
    [$branch, $barber] = branchWithBarber();
    $day1 = bookingDay();
    $day0 = $day1->subDay();
    $day2 = $day1->addDay();

    $key = fn (CarbonImmutable $d): string => "booking:occupancy:{$branch->id}:{$barber->id}:".$d->format('Y-m-d');

    foreach ([$day0, $day1, $day2] as $d) {
        Cache::put($key($d), ['windows' => [], 'bookings' => [], 'blocks' => []], 60);
    }

    // OccupancyCache::build() looks one day BACKWARD when gathering a day's
    // bookings, to catch a footprint bleeding in from the day before. So a
    // booking saved on day1 can affect day2's cached occupancy -- never day0's.
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $day1->setTime(10, 0),
        'ends_at' => $day1->setTime(10, 30),
        'duration_minutes' => 30,
    ]);

    expect(Cache::has($key($day0)))->toBeTrue()
        ->and(Cache::has($key($day1)))->toBeFalse()
        ->and(Cache::has($key($day2)))->toBeFalse();
});
