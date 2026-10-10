<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Carbon\CarbonImmutable;

/**
 * Half-open interval overlap: [start, end). Back-to-back ranges — one ending exactly
 * when the next begins — do not overlap, which is what makes consecutive bookings
 * possible at all.
 *
 * Pure and clock-free on purpose: MySQL cannot express an overlap constraint and
 * SQLite ignores lockForUpdate, so this rule is the one thing that must be provably
 * right without a database.
 */
final class OverlapGuard
{
    /** @param  array<int, array{0: CarbonImmutable, 1: CarbonImmutable}>  $ranges */
    public static function overlaps(CarbonImmutable $start, CarbonImmutable $end, array $ranges): bool
    {
        foreach ($ranges as [$busyStart, $busyEnd]) {
            if ($start->lt($busyEnd) && $busyStart->lt($end)) {
                return true;
            }
        }

        return false;
    }
}
