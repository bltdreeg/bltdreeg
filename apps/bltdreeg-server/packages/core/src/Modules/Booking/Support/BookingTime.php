<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Carbon\CarbonImmutable;

final class BookingTime
{
    public static function zone(): string
    {
        return (string) config('booking.timezone', 'Africa/Cairo');
    }

    /** Right now, in branch-local wall clock. */
    public static function now(): CarbonImmutable
    {
        return CarbonImmutable::now(self::zone());
    }

    /** A calendar day in branch-local wall clock, at midnight. */
    public static function day(string|CarbonImmutable $date): CarbonImmutable
    {
        return $date instanceof CarbonImmutable
            ? $date->setTimezone(self::zone())->startOfDay()
            : CarbonImmutable::parse($date, self::zone())->startOfDay();
    }

    /**
     * The half-open [start, end) range of one branch-local calendar day, as UTC
     * instants. The end is computed by stepping forward one day from midnight,
     * never by parsing or asking for "23:59:59" directly.
     *
     * On Egypt's DST fall-back day the local wall clock repeats 23:00-23:59
     * twice: `endOfDay()` resolves to the FIRST occurrence of 23:59:59, but a
     * booking actually taken in the SECOND occurrence of that hour is a real,
     * later UTC instant that an `endOfDay()`-bounded range would miss entirely —
     * making it invisible to occupancy, the overlap check and the write lock.
     * Walking forward from the unambiguous midnight start has no such gap.
     *
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    public static function dayRangeUtc(CarbonImmutable $localDay): array
    {
        $start = $localDay->setTimezone(self::zone())->startOfDay();

        return [$start->utc(), $start->addDay()->utc()];
    }
}
