<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Events\BookingCancelled;
use Bltdreeg\Core\Modules\Booking\Events\BookingCreated;
use Bltdreeg\Core\Modules\Booking\Events\BookingRescheduled;
use Bltdreeg\Core\Modules\Booking\Exceptions\BookingException;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Booking\Support\AvailabilityEngine;
use Bltdreeg\Core\Modules\Booking\Support\BasketResolver;
use Bltdreeg\Core\Modules\Booking\Support\BookingService;
use Bltdreeg\Core\Modules\Booking\Support\BookingTime;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-01 09:00:00', BookingTime::zone()));
});

afterEach(function () {
    CarbonImmutable::setTestNow();
});

function bookingFixture(array $branchAttributes = []): array
{
    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 30,
        'booking_gap_minutes' => 0,
        'booking_days_ahead' => 30,
        'booking_min_notice_minutes' => 60,
        'booking_cancel_cutoff_minutes' => 120,
        ...$branchAttributes,
    ]);
    $barber = User::factory()->create(['branch_id' => $branch->id]);
    $jobType = JobType::factory()->create(['tenant_id' => $branch->tenant_id, 'is_bookable' => true]);
    $barber->tenants()->attach($branch->tenant_id, ['job_type_id' => $jobType->getKey()]);
    $day = BookingTime::day('2026-11-02');

    BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => (int) $day->dayOfWeek,
        'start_time' => '10:00',
        'end_time' => '14:00',
        'is_active' => true,
    ]);

    $service = Service::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => 30,
        'price' => 120,
    ]);

    $basket = BasketResolver::resolve($branch, [$service->id], []);

    return [$branch, $barber, $day, $basket];
}

test('a customer booking is confirmed and records its items', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $customer = Customer::factory()->create();

    $booking = app(BookingService::class)
        ->book($branch, $barber, $basket, $day->setTime(10, 0), $customer);

    expect($booking->status)->toBe(BookingStatusEnum::Confirmed)
        ->and($booking->source)->toBe(BookingSourceEnum::App)
        ->and($booking->customer_id)->toBe($customer->id)
        ->and($booking->duration_minutes)->toBe(30)
        ->and((float) $booking->total_price)->toBe(120.0)
        ->and($booking->booking_code)->not->toBeEmpty()
        ->and($booking->items)->toHaveCount(1);
});

test('booking a taken time is refused', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    expect(fn () => $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('booking outside the working window is refused', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();

    expect(fn () => app(BookingService::class)
        ->book($branch, $barber, $basket, $day->setTime(16, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('booking inside the minimum notice is refused', function () {
    [$branch, $barber, , $basket] = bookingFixture(['booking_min_notice_minutes' => 240]);
    $today = BookingTime::day('2026-11-01');

    BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => (int) $today->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '14:00',
        'is_active' => true,
    ]);

    expect(fn () => app(BookingService::class)
        ->book($branch, $barber, $basket, $today->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('booking a blocked time is refused', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();

    BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => $day->setTime(10, 0)->utc(),
        'ends_at' => $day->setTime(11, 0)->utc(),
    ]);

    expect(fn () => app(BookingService::class)
        ->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('a manual booking stores a free-text name and phone and no customer', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();

    $booking = app(BookingService::class)->createManual(
        $branch, $barber, $basket, $day->setTime(10, 0), 'أحمد', '+201000000001', 'Regular'
    );

    expect($booking->customer_id)->toBeNull()
        ->and($booking->guest_name)->toBe('أحمد')
        ->and($booking->guest_phone)->toBe('+201000000001')
        ->and($booking->source)->toBe(BookingSourceEnum::Dashboard)
        ->and($booking->is_forced)->toBeFalse()
        ->and($booking->customerLabel())->toBe('أحمد');
});

test('a manual booking obeys the rules unless it is forced', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    expect(fn () => $service->createManual($branch, $barber, $basket, $day->setTime(16, 0), 'أحمد', '+201000000001'))
        ->toThrow(BookingException::class);

    $forced = $service->createManual(
        $branch, $barber, $basket, $day->setTime(16, 0), 'أحمد', '+201000000001', null, override: true
    );

    expect($forced->is_forced)->toBeTrue()
        ->and($forced->starts_at->setTimezone(BookingTime::zone())->format('H:i'))->toBe('16:00');
});

test('a forced booking may double-book the barber', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    $forced = $service->createManual(
        $branch, $barber, $basket, $day->setTime(10, 0), 'أحمد', '+201000000001', null, override: true
    );

    expect($forced->is_forced)->toBeTrue();
});

test('cancelling frees the slot and keeps an audit trail', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $booking = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $cancelled = $service->cancel($booking, byCustomer: true);

    expect($cancelled->status)->toBe(BookingStatusEnum::Cancelled)
        ->and($cancelled->cancelled_at)->not->toBeNull()
        ->and($cancelled->cancelled_by_customer)->toBeTrue();

    // The time is free again.
    $again = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    expect($again->id)->not->toBe($booking->id);
});

test('a customer cannot cancel past the cutoff but the salon can', function () {
    [$branch, $barber, , $basket] = bookingFixture(['booking_cancel_cutoff_minutes' => 120, 'booking_min_notice_minutes' => 0]);
    $today = BookingTime::day('2026-11-01');

    BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => (int) $today->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '14:00',
        'is_active' => true,
    ]);

    $service = app(BookingService::class);
    // now is 09:00, booking at 10:00 — inside a 120-minute cutoff.
    $booking = $service->book($branch, $barber, $basket, $today->setTime(10, 0), Customer::factory()->create());

    expect(fn () => $service->cancel($booking, byCustomer: true))
        ->toThrow(BookingException::class);

    expect($service->cancel($booking, byCustomer: false)->status)->toBe(BookingStatusEnum::Cancelled);
});

test('rescheduling moves the booking and links the old one', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $booking = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $moved = $service->reschedule($booking, $day->setTime(11, 0));

    expect($moved->id)->not->toBe($booking->id)
        ->and($moved->rescheduled_from_id)->toBe($booking->id)
        ->and($moved->starts_at->setTimezone(BookingTime::zone())->format('H:i'))->toBe('11:00')
        ->and($moved->items)->toHaveCount(1)
        ->and($booking->fresh()->status)->toBe(BookingStatusEnum::Cancelled);
});

test('rescheduling onto a taken time is refused and the original survives', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $mine = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $theirs = $service->book($branch, $barber, $basket, $day->setTime(11, 0), Customer::factory()->create());

    expect(fn () => $service->reschedule($mine, $day->setTime(11, 0)))
        ->toThrow(BookingException::class);

    expect($mine->fresh()->status)->toBe(BookingStatusEnum::Confirmed)
        ->and($theirs->fresh()->status)->toBe(BookingStatusEnum::Confirmed);
});

test('completed and no-show are terminal', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $one = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $two = $service->book($branch, $barber, $basket, $day->setTime(11, 0), Customer::factory()->create());

    expect($service->markCompleted($one)->status)->toBe(BookingStatusEnum::Completed)
        ->and($service->markNoShow($two)->status)->toBe(BookingStatusEnum::NoShow);

    expect(fn () => $service->cancel($one->fresh(), byCustomer: false))
        ->toThrow(BookingException::class);
});

test('the lifecycle fires its domain events', function () {
    Event::fake([BookingCreated::class, BookingCancelled::class, BookingRescheduled::class]);

    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $booking = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $service->reschedule($booking, $day->setTime(12, 0));

    Event::assertDispatched(BookingCreated::class);
    Event::assertDispatched(BookingRescheduled::class);
});

test('a failed reschedule does not leave the occupancy cache believing the original slot is free', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    // "mine" holds 10:00-10:30. "theirs" holds 11:00-11:30, so moving mine onto
    // 11:00 must fail.
    $mine = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $service->book($branch, $barber, $basket, $day->setTime(11, 0), Customer::factory()->create());

    expect(fn () => $service->reschedule($mine, $day->setTime(11, 0)))
        ->toThrow(BookingException::class);

    // assertBookable() temporarily marks "mine" Cancelled to check whether it would
    // block its own new time, then rebuilds the occupancy cache from that
    // mid-transaction state before the failure rolls the status change back. If
    // that rebuilt cache entry survives the rollback, mine's OWN original slot
    // reads back as available even though mine is still Confirmed in the database.
    expect($mine->fresh()->status)->toBe(BookingStatusEnum::Confirmed)
        ->and(AvailabilityEngine::isBookable($branch, $barber, $day->setTime(10, 0), 30))->toBeFalse();
});

test('the write-path check ignores a stale occupancy cache', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();

    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $day->setTime(10, 0)->utc(),
        'ends_at' => $day->setTime(10, 30)->utc(),
        'duration_minutes' => 30,
    ]);

    // Simulates the production race (spec §4.11): a concurrent availability read
    // rebuilt and cached this day's occupancy from a view of the database that
    // predates the booking above becoming visible -- e.g. a reader that ran
    // inside the writer's still-open transaction, before commit. By whatever
    // mechanism, the cache now says "nothing is booked" even though a real,
    // committed booking occupies 10:00-10:30.
    Cache::put(
        'booking:occupancy:'.$branch->id.':'.$barber->id.':'.$day->format('Y-m-d'),
        ['windows' => [['start_time' => '10:00:00', 'end_time' => '14:00:00']], 'bookings' => [], 'blocks' => []],
        60
    );

    // A read through the cache would still see the stale "free" value -- but a
    // WRITE through BookingService must not: the write path's re-check reads the
    // database directly (useCache: false), never this cache entry.
    expect(fn () => app(BookingService::class)
        ->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('two writers cannot take the same slot', function () {
    if (app('db')->connection()->getDriverName() === 'sqlite') {
        $this->markTestSkipped('SQLite ignores lockForUpdate; run this against MySQL to exercise the row lock.');
    }

    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    expect(fn () => $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('booking a non-bookable employee is refused, even when forced', function () {
    [$branch, , $day, $basket] = bookingFixture();
    $plainEmployee = User::factory()->create(['branch_id' => $branch->id]); // no bookable job type

    BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $plainEmployee->id,
        'weekday' => (int) $day->dayOfWeek,
        'start_time' => '10:00',
        'end_time' => '14:00',
        'is_active' => true,
    ]);

    $service = app(BookingService::class);

    expect(fn () => $service->book($branch, $plainEmployee, $basket, $day->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);

    expect(fn () => $service->createManual(
        $branch, $plainEmployee, $basket, $day->setTime(10, 0), 'أحمد', '+201000000001', null, override: true
    ))->toThrow(BookingException::class);
});

test('rescheduling onto a non-bookable barber is refused', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $plainEmployee = User::factory()->create(['branch_id' => $branch->id]); // no bookable job type

    // Same schedule as the fixture's real barber, so the ONLY thing that can
    // refuse this move is the identity check -- not a missing window.
    BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $plainEmployee->id,
        'weekday' => (int) $day->dayOfWeek,
        'start_time' => '10:00',
        'end_time' => '14:00',
        'is_active' => true,
    ]);

    $service = app(BookingService::class);
    $booking = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    expect(fn () => $service->reschedule($booking, $day->setTime(11, 0), $plainEmployee))
        ->toThrow(BookingException::class);
});
