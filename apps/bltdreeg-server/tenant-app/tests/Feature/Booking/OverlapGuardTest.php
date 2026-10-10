<?php

use Bltdreeg\Core\Modules\Booking\Support\OverlapGuard;
use Carbon\CarbonImmutable;

function busyRange(string $start, string $end): array
{
    return [CarbonImmutable::parse($start), CarbonImmutable::parse($end)];
}

test('a range overlapping an existing one is caught', function () {
    $busy = [busyRange('2026-11-02 10:00', '2026-11-02 11:00')];

    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 10:30'), CarbonImmutable::parse('2026-11-02 11:30'), $busy))->toBeTrue();
});

test('touching end to start does not overlap', function () {
    $busy = [busyRange('2026-11-02 10:00', '2026-11-02 11:00')];

    // 11:00–12:00 starts exactly when the other ends: back-to-back is allowed.
    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 11:00'), CarbonImmutable::parse('2026-11-02 12:00'), $busy))->toBeFalse()
        // 09:00–10:00 ends exactly when the other starts.
        ->and(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 09:00'), CarbonImmutable::parse('2026-11-02 10:00'), $busy))->toBeFalse();
});

test('a range fully inside an existing one is caught', function () {
    $busy = [busyRange('2026-11-02 10:00', '2026-11-02 12:00')];

    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 10:30'), CarbonImmutable::parse('2026-11-02 11:00'), $busy))->toBeTrue();
});

test('a range fully containing an existing one is caught', function () {
    $busy = [busyRange('2026-11-02 10:30', '2026-11-02 11:00')];

    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 10:00'), CarbonImmutable::parse('2026-11-02 12:00'), $busy))->toBeTrue();
});

test('no ranges means no overlap', function () {
    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 10:00'), CarbonImmutable::parse('2026-11-02 11:00'), []))->toBeFalse();
});

test('overlap is detected across timezones for the same instant', function () {
    $busy = [busyRange('2026-11-02 08:00:00 UTC', '2026-11-02 09:00:00 UTC')];

    // 10:30 Cairo in November is 08:30 UTC, inside the busy range.
    expect(OverlapGuard::overlaps(
        CarbonImmutable::parse('2026-11-02 10:30:00', 'Africa/Cairo'),
        CarbonImmutable::parse('2026-11-02 11:00:00', 'Africa/Cairo'),
        $busy
    ))->toBeTrue();
});
