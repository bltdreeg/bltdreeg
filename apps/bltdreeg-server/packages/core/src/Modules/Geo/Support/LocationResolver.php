<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;

/**
 * Turns a point, an IP or a chosen area into a full governorate/city/area location.
 * Areas only have centroids (no polygons), so "which area" = nearest centroid.
 */
class LocationResolver
{
    /** Box half-widths in degrees, widened until candidates exist. null = all areas. */
    private const SEARCH_DELTAS = [0.05, 0.2, 1.0, null];

    public function __construct(private IpGeolocator $ipGeolocator) {}

    public function nearest(float $lat, float $lng, LocationSourceEnum $source): ResolvedLocation
    {
        foreach (self::SEARCH_DELTAS as $delta) {
            $query = GeoArea::query();

            if ($delta !== null) {
                $query->whereBetween('lat', [$lat - $delta, $lat + $delta])
                    ->whereBetween('lng', [$lng - $delta, $lng + $delta]);
            }

            $nearest = $query->get()
                ->sortBy(fn (GeoArea $area): float => self::distanceKm($lat, $lng, $area->lat, $area->lng))
                ->first();

            if ($nearest !== null) {
                return new ResolvedLocation($nearest, $lat, $lng, $source);
            }
        }

        return $this->fallback();
    }

    public function fromIp(?string $ip): ResolvedLocation
    {
        $coordinates = $ip === null ? null : $this->ipGeolocator->locate($ip);

        // VPN بيطلّع دولة تانية: منقبلش نقطة برا مصر
        if ($coordinates === null || ! EgyptBounds::contains($coordinates->lat, $coordinates->lng)) {
            return $this->fallback();
        }

        return $this->nearest($coordinates->lat, $coordinates->lng, LocationSourceEnum::Ip);
    }

    public function fallback(): ResolvedLocation
    {
        $area = GeoArea::query()->findOrFail(config('geo.default_area_id'));

        return new ResolvedLocation($area, $area->lat, $area->lng, LocationSourceEnum::Default);
    }

    /**
     * The user picked an area. Keep their precise point only if it lies in the same city.
     */
    public function forArea(string $areaId, ?float $lat, ?float $lng, LocationSourceEnum $source): ResolvedLocation
    {
        $area = GeoArea::query()->findOrFail($areaId);

        if ($lat !== null && $lng !== null && EgyptBounds::contains($lat, $lng)
            && $this->nearest($lat, $lng, $source)->cityId() === $area->city_id) {
            return new ResolvedLocation($area, $lat, $lng, $source);
        }

        return new ResolvedLocation($area, $area->lat, $area->lng, LocationSourceEnum::Manual);
    }

    private static function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 6371 * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
