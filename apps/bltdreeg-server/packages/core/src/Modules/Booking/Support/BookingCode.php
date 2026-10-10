<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Booking\Models\Booking;

/**
 * A short code the customer can read out at the salon. Unambiguous alphabet: no
 * O/0 or I/1, because these get read over the phone.
 */
final class BookingCode
{
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public static function generate(): string
    {
        do {
            $code = self::random(3).'-'.self::random(3);
        } while (Booking::query()->withoutGlobalScopes()->where('booking_code', $code)->exists());

        return $code;
    }

    private static function random(int $length): string
    {
        $out = '';

        for ($i = 0; $i < $length; $i++) {
            $out .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
        }

        return $out;
    }
}
