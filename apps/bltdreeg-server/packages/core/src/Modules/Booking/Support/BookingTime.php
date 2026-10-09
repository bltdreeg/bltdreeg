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
}
