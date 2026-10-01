<?php

namespace App\Modules\V1\Customer\Auth\Support;

class PhoneNumber
{
    /**
     * Egyptian mobile network prefixes: 010, 011, 012, 015
     */
    protected const EG_PREFIXES = ['010', '011', '012', '015'];

    /**
     * Normalise phone to E.164 format (+201XXXXXXXXX).
     */
    public static function toE164(string $input): ?string
    {
        $local = self::toLocal($input);
        if ($local === null) {
            return null;
        }

        return '+20'.substr($local, 1);
    }

    /**
     * Normalise phone to local 11-digit Egyptian format (01XXXXXXXXX).
     */
    public static function toLocal(string $input): ?string
    {
        // Strip everything except digits and +
        $cleaned = preg_replace('/[^\d+]/', '', trim($input));

        if (str_starts_with($cleaned, '+20')) {
            $cleaned = '0'.substr($cleaned, 3);
        } elseif (str_starts_with($cleaned, '0020')) {
            $cleaned = '0'.substr($cleaned, 4);
        } elseif (str_starts_with($cleaned, '20') && strlen($cleaned) === 12) {
            $cleaned = '0'.substr($cleaned, 2);
        }

        if (strlen($cleaned) !== 11 || ! str_starts_with($cleaned, '01')) {
            return null;
        }

        $prefix = substr($cleaned, 0, 3);
        if (! in_array($prefix, self::EG_PREFIXES, true)) {
            return null;
        }

        return $cleaned;
    }

    /**
     * Check if the input is a valid Egyptian mobile number.
     */
    public static function isValid(string $input): bool
    {
        return self::toLocal($input) !== null;
    }
}
