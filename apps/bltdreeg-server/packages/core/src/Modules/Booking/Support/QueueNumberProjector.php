<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;

/**
 * "رقمك في الدور" — the customer's position among that barber's bookings for the
 * day, by appointment start. Derived on read, never stored (ADR 0004), so a
 * cancellation renumbers everyone behind it with no write.
 */
final class QueueNumberProjector
{
    public static function for(Booking $booking): int
    {
        return self::rank(
            (int) $booking->barber_user_id,
            self::localDate($booking->starts_at),
            $booking->starts_at,
            exceptId: $booking->getKey(),
        );
    }

    public static function preview(Branch $branch, User $barber, CarbonImmutable $startsAt): int
    {
        return self::rank(
            $barber->getKey(),
            self::localDate($startsAt),
            $startsAt,
        );
    }

    private static function rank(int $barberId, CarbonImmutable $localDate, CarbonImmutable $startsAt, int|string|null $exceptId = null): int
    {
        $ahead = Booking::query()
            ->withoutGlobalScopes()
            ->occupying()
            ->forBarberOn($barberId, $localDate)
            ->where('starts_at', '<', $startsAt->utc())
            ->when($exceptId !== null, fn ($query) => $query->whereKeyNot($exceptId))
            ->count();

        return $ahead + 1;
    }

    private static function localDate(CarbonImmutable $moment): CarbonImmutable
    {
        return $moment->setTimezone(BookingTime::zone());
    }
}
