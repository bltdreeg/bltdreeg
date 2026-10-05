<?php

namespace App\Modules\V1\Customer\Auth\Enums;

enum LocationSourceEnum: int
{
    case Gps = 1;
    case Ip = 2;
    case Manual = 3; // العميل حط الدبوس بنفسه على الخريطة — أعلى ثقة

    public function label(): string
    {
        return match ($this) {
            self::Gps => 'gps',
            self::Ip => 'ip',
            self::Manual => 'manual',
        };
    }

    public static function fromLabel(string $label): self
    {
        return match ($label) {
            'manual' => self::Manual,
            'ip' => self::Ip,
            default => self::Gps,
        };
    }
}
