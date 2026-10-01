<?php

namespace App\Modules\V1\Customer\Auth\Enums;

enum SocialProviderEnum: int
{
    case Google = 1;
    case Apple = 2;

    public function slug(): string
    {
        return match ($this) {
            self::Google => 'google',
            self::Apple => 'apple',
        };
    }

    public static function tryFromSlug(string $slug): ?self
    {
        return match (strtolower($slug)) {
            'google' => self::Google,
            'apple' => self::Apple,
            default => null,
        };
    }
}
