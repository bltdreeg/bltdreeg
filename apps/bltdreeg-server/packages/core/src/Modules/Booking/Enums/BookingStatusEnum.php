<?php

namespace Bltdreeg\Core\Modules\Booking\Enums;

enum BookingStatusEnum: string
{
    case Confirmed = 'confirmed';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';

    /**
     * Whether the booking still holds its place on the barber's day. Cancelled and
     * no-show bookings release their time: the slot returns to availability and the
     * bookings behind them move up a queue number.
     */
    public function occupiesTime(): bool
    {
        return match ($this) {
            self::Confirmed, self::Completed => true,
            self::Cancelled, self::NoShow => false,
        };
    }

    /** @return array<int, string> */
    public static function occupying(): array
    {
        return array_values(array_map(
            fn (self $case): string => $case->value,
            array_filter(self::cases(), fn (self $case): bool => $case->occupiesTime()),
        ));
    }

    public function isTerminal(): bool
    {
        return $this !== self::Confirmed;
    }
}
