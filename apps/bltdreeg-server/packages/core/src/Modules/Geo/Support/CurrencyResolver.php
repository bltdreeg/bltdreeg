<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;

final class CurrencyResolver
{
    public const DEFAULT = CurrencyEnum::EGP;

    /**
     * Currency by the country a point falls in. The geo data only covers Egypt today, so a new country is one more entry here.
     *
     * @return list<array{0: CurrencyEnum, 1: callable(float, float): bool}>
     */
    private static function countries(): array
    {
        return [
            [CurrencyEnum::EGP, EgyptBounds::contains(...)],
        ];
    }

    public static function forCoordinates(float $lat, float $lng): CurrencyEnum
    {
        foreach (self::countries() as [$currency, $contains]) {
            if ($contains($lat, $lng)) {
                return $currency;
            }
        }

        return self::DEFAULT;
    }
}
