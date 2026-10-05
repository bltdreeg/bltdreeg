<?php

namespace Bltdreeg\Core\Modules\Geo\Enums;

enum LocationSourceEnum: int
{
    case Gps = 1;
    case Ip = 2;
    case Manual = 3; // المستخدم اختار المنطقة/الدبوس بنفسه — أعلى ثقة
    case MapsUrl = 4;
    case Default = 5; // مفيش GPS ولا IP صالح — القاهرة الافتراضية

    public function label(): string
    {
        return match ($this) {
            self::Gps => 'gps',
            self::Ip => 'ip',
            self::Manual => 'manual',
            self::MapsUrl => 'maps_url',
            self::Default => 'default',
        };
    }

    public static function tryFromLabel(?string $label): ?self
    {
        foreach (self::cases() as $case) {
            if ($case->label() === $label) {
                return $case;
            }
        }

        return null;
    }

    public function trustRank(): int
    {
        return match ($this) {
            self::Default => 0,
            self::Ip => 1,
            self::Gps => 2,
            self::Manual, self::MapsUrl => 3,
        };
    }

    /**
     * An automatic update (IP fallback, background GPS) never replaces a more trusted or user-chosen value.
     */
    public function canBeReplacedAutomaticallyBy(self $incoming): bool
    {
        return $this->trustRank() < 3 && $incoming->trustRank() >= $this->trustRank();
    }
}
