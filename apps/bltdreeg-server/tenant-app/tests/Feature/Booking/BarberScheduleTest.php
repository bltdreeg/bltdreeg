<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberBookingSettings;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Booking\Support\BookingSettings;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function barberIn(Branch $branch): User
{
    return User::factory()->create(['branch_id' => $branch->id]);
}

function scheduleFor(Branch $branch, User $barber, int $weekday, string $start, string $end): BarberSchedule
{
    return BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => $weekday,
        'start_time' => $start,
        'end_time' => $end,
        'is_active' => true,
    ]);
}

test('a weekly window is stored normalized to H:i:s', function () {
    $branch = Branch::factory()->create();
    $schedule = scheduleFor($branch, barberIn($branch), 0, '10:00', '14:00')->fresh();

    expect($schedule->start_time)->toBe('10:00:00')
        ->and($schedule->end_time)->toBe('14:00:00');
});

test('a barber can have two windows on the same weekday', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    scheduleFor($branch, $barber, 0, '10:00', '14:00');
    scheduleFor($branch, $barber, 0, '17:00', '22:00');

    expect(BarberSchedule::query()->where('user_id', $barber->id)->count())->toBe(2);
});

test('a window ending before it starts is rejected', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    expect(fn () => scheduleFor($branch, $barber, 0, '14:00', '10:00'))
        ->toThrow(InvalidArgumentException::class, 'end_time must be after start_time');
});

test('a window crossing midnight is rejected with a clear message', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    expect(fn () => scheduleFor($branch, $barber, 0, '22:00', '02:00'))
        ->toThrow(InvalidArgumentException::class, 'end_time must be after start_time');
});

test('overlapping windows on the same weekday are rejected', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    scheduleFor($branch, $barber, 0, '10:00', '14:00');

    expect(fn () => scheduleFor($branch, $barber, 0, '13:00', '16:00'))
        ->toThrow(InvalidArgumentException::class, 'overlaps');
});

test('the same window on a different weekday is fine', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    scheduleFor($branch, $barber, 0, '10:00', '14:00');
    scheduleFor($branch, $barber, 1, '10:00', '14:00');

    expect(BarberSchedule::query()->where('user_id', $barber->id)->count())->toBe(2);
});

test('settings fall back to the branch defaults', function () {
    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 20,
        'booking_gap_minutes' => 5,
        'booking_days_ahead' => 7,
        'booking_min_notice_minutes' => 30,
        'booking_cancel_cutoff_minutes' => 90,
    ]);

    $settings = BookingSettings::resolve($branch, barberIn($branch));

    expect($settings->slotStepMinutes)->toBe(20)
        ->and($settings->gapMinutes)->toBe(5)
        ->and($settings->maxDaysAhead)->toBe(7)
        ->and($settings->minNoticeMinutes)->toBe(30)
        ->and($settings->cancelCutoffMinutes)->toBe(90)
        ->and($settings->isPaused)->toBeFalse();
});

test('a barber override beats the branch default', function () {
    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 20,
        'booking_days_ahead' => 7,
    ]);
    $barber = barberIn($branch);

    BarberBookingSettings::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'slot_step_minutes' => 15,
        'gap_minutes' => 10,
        'is_paused' => true,
        'max_days_ahead' => 3,
    ]);

    $settings = BookingSettings::resolve($branch, $barber);

    expect($settings->slotStepMinutes)->toBe(15)
        ->and($settings->gapMinutes)->toBe(10)
        ->and($settings->maxDaysAhead)->toBe(3)
        ->and($settings->isPaused)->toBeTrue()
        // min_notice_minutes left null on the override, so the branch value stands
        ->and($settings->minNoticeMinutes)->toBe((int) $branch->booking_min_notice_minutes);
});

test('a time block records a range and a full-day flag', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    $block = BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => '2026-11-10 08:00:00',
        'ends_at' => '2026-11-15 20:00:00',
        'is_full_day' => true,
        'reason' => 'Leave',
    ])->fresh();

    expect($block->is_full_day)->toBeTrue()
        ->and($block->starts_at->toDateString())->toBe('2026-11-10')
        ->and($block->reason)->toBe('Leave');
});

test('a branch-local time block is stored and read back as the same UTC instant', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    // Cairo is UTC+2 on this date. 10:30 local must be stored as 08:30 UTC.
    $localStart = CarbonImmutable::parse('2026-11-02 10:30:00', 'Africa/Cairo');

    $block = BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => $localStart,
        'ends_at' => $localStart->addHour(),
        'is_full_day' => false,
    ]);

    expect($block->fresh()->starts_at->utc()->format('H:i'))->toBe('08:30')
        ->and($block->fresh()->starts_at->getTimestamp())->toBe($localStart->getTimestamp());
});
