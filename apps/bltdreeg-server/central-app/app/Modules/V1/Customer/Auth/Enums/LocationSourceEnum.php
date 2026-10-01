<?php

namespace App\Modules\V1\Customer\Auth\Enums;

enum LocationSourceEnum: int
{
    case Gps = 1;
    case Ip = 2;

    public function label(): string
    {
        return match ($this) {
            self::Gps => 'gps',
            self::Ip => 'ip',
        };
    }
}
