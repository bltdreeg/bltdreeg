<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Illuminate\Support\Facades\Log;

/**
 * Turns a point, an IP or a chosen area into a full governorate/city/area location.
 * Areas only have centroids (no polygons), so "which area" = nearest centroid.
 */
class LocationResolver
{
    public function __construct(private IpGeolocator $ipGeolocator) {}

    public function nearest(float $lat, float $lng, LocationSourceEnum $source): ResolvedLocation
    {
        // MySQL POINT takes (lng, lat)
        $nearest = GeoArea::query()
            ->orderByRaw('ST_Distance_Sphere(POINT(lng, lat), POINT(?, ?))', [$lng, $lat])
            ->first();

        return $nearest !== null
            ? new ResolvedLocation($nearest, $lat, $lng, $source)
            : $this->fallback();
    }

    /**
     * The user picked only a city. Keep their precise point (and its nearest area) if it lies in that
     * city, otherwise use the city's first real area at its centroid.
     */
    public function forCity(string $cityId, ?float $lat, ?float $lng, LocationSourceEnum $source): ResolvedLocation
    {
        if ($lat !== null && $lng !== null && EgyptBounds::contains($lat, $lng)) {
            $nearest = $this->nearest($lat, $lng, $source);

            if ($nearest->cityId() === $cityId) {
                return $nearest;
            }
        }

        $area = GeoArea::query()->where('city_id', $cityId)->orderBy('is_placeholder')->orderBy('id')->firstOrFail();

        return new ResolvedLocation($area, $area->lat, $area->lng, LocationSourceEnum::Manual);
    }

    public function fromIp(?string $ip): ResolvedLocation
    {
        $coordinates = $ip === null ? null : $this->ipGeolocator->locate($ip);
        // debug مش info: ده بقى بيتنادى على كل زيارة لصفحة رئيسية لأي زائر (nearby-branches العام)،
        // مش بس على تسجيل/تحديث موقع مسجّل الدخول. info كانت تبقى آلاف السطور يوميًا فيها IP وموقع تقريبي للزوار
        Log::debug('geo.from_ip', ['ip' => $ip, 'lat' => $coordinates?->lat, 'lng' => $coordinates?->lng]);

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
}
