<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Booking\Support\QueueNumberProjector;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function bookingAt(Branch $branch, User $barber, string $startsAt, int $minutes = 30, BookingStatusEnum $status = BookingStatusEnum::Confirmed): Booking
{
    $start = CarbonImmutable::parse($startsAt);

    return Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes($minutes),
        'duration_minutes' => $minutes,
        'status' => $status,
    ]);
}

test('queue numbers follow appointment start time', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    $second = bookingAt($branch, $barber, '2026-11-02 18:30:00');
    $first = bookingAt($branch, $barber, '2026-11-02 17:00:00');
    $third = bookingAt($branch, $barber, '2026-11-02 19:00:00');

    expect(QueueNumberProjector::for($first))->toBe(1)
        ->and(QueueNumberProjector::for($second))->toBe(2)
        ->and(QueueNumberProjector::for($third))->toBe(3);
});

test('cancelling a booking renumbers the ones behind it', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    $first = bookingAt($branch, $barber, '2026-11-02 17:00:00');
    $second = bookingAt($branch, $barber, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::for($second))->toBe(2);

    $first->update(['status' => BookingStatusEnum::Cancelled]);

    expect(QueueNumberProjector::for($second->fresh()))->toBe(1);
});

test('a no-show does not hold a queue position', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    bookingAt($branch, $barber, '2026-11-02 17:00:00', status: BookingStatusEnum::NoShow);
    $mine = bookingAt($branch, $barber, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::for($mine))->toBe(1);
});

test('queue numbers are per barber', function () {
    $branch = Branch::factory()->create();
    $one = User::factory()->create(['branch_id' => $branch->id]);
    $two = User::factory()->create(['branch_id' => $branch->id]);

    bookingAt($branch, $one, '2026-11-02 17:00:00');
    $mine = bookingAt($branch, $two, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::for($mine))->toBe(1);
});

test('queue numbers are per day', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    bookingAt($branch, $barber, '2026-11-01 17:00:00');
    $mine = bookingAt($branch, $barber, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::for($mine))->toBe(1);
});

test('a preview says what position a time would take', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    bookingAt($branch, $barber, '2026-11-02 17:00:00');
    bookingAt($branch, $barber, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::preview($branch, $barber, CarbonImmutable::parse('2026-11-02 19:00:00')))->toBe(3)
        ->and(QueueNumberProjector::preview($branch, $barber, CarbonImmutable::parse('2026-11-02 16:00:00')))->toBe(1);
});

test('a booking keeps snapshot items', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);
    $booking = bookingAt($branch, $barber, '2026-11-02 17:00:00');

    $booking->items()->create([
        'name_snapshot' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
        'price_snapshot' => 120.00,
        'duration_snapshot' => 30,
        'sort' => 0,
    ]);

    expect($booking->fresh()->items)->toHaveCount(1)
        ->and($booking->fresh()->items->first()->duration_snapshot)->toBe(30);
});

test('the footprint extends past the appointment by its own stored gap', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    $booking = bookingAt($branch, $barber, '2026-11-02 17:00:00', 30);
    $booking->update(['gap_minutes' => 10]);

    expect($booking->fresh()->footprintEndsAt()->format('H:i'))->toBe('17:40');
});
