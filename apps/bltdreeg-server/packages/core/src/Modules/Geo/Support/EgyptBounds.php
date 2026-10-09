<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

final class EgyptBounds
{
    /** @var array{0: float, 1: float} */
    public const LAT = [21.5, 32.0];

    /** @var array{0: float, 1: float} */
    public const LNG = [24.5, 37.0];

    public static function contains(float $lat, float $lng): bool
    {
        return $lat >= self::LAT[0] && $lat <= self::LAT[1]
            && $lng >= self::LNG[0] && $lng <= self::LNG[1];
    }
}
