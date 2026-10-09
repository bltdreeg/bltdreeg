<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Illuminate\Support\Facades\Log;

/**
 * Turns a point, an IP or a chosen city into a full governorate/city location.
 * Cities only have centroids (no polygons), so "which city" = nearest centroid.
 */
class LocationResolver
{
    public function __construct(private IpGeolocator $ipGeolocator) {}

    public function nearest(float $lat, float $lng, LocationSourceEnum $source): ResolvedLocation
    {
        // Cache nearest city lookup by coordinates rounded to 2 decimal places (~1.1km)
        // to share the expensive ST_Distance_Sphere query across close-proximity requests
        $cacheKey = sprintf('nearest:%.2f:%.2f', $lat, $lng);

        $nearestCityId = GeoCity::remember($cacheKey, function () use ($lat, $lng) {
            // MySQL POINT takes (lng, lat)
            return GeoCity::query()
                ->orderByRaw('ST_Distance_Sphere(POINT(lng, lat), POINT(?, ?))', [$lng, $lat])
                ->value('id');
        }, now()->addDays(7));

        $nearest = GeoCity::find($nearestCityId);

        return $nearest !== null
            ? new ResolvedLocation($nearest, $lat, $lng, $source)
            : $this->fallback();
    }

    /**
     * The user picked a city. Keep their precise point if it's actually nearest to that city,
     * otherwise use the city's centroid.
     */
    public function forCity(string $cityId, ?float $lat, ?float $lng, LocationSourceEnum $source): ResolvedLocation
    {
        if ($lat !== null && $lng !== null && EgyptBounds::contains($lat, $lng)) {
            $nearest = $this->nearest($lat, $lng, $source);

            if ($nearest->cityId() === $cityId) {
                return $nearest;
            }
        }

        $city = GeoCity::findOrFail($cityId);

        return new ResolvedLocation($city, $city->lat, $city->lng, LocationSourceEnum::Manual);
    }

    public function fromIp(?string $ip): ResolvedLocation
    {
        if ($ip === null) {
            return $this->fallback();
        }

        // Cache only a plain array, never the resolved object: GeoCity::remember()
        // stores through the app's cache config, which refuses to unserialize any
        // object back (see CachableModel's docblock) — an object here would come
        // back as __PHP_Incomplete_Class on every cache hit.
        $resolved = GeoCity::remember("ip:{$ip}", function () use ($ip) {
            $coordinates = $this->ipGeolocator->locate($ip);
            // debug مش info: ده بقى بيتنادى على كل زيارة لصفحة رئيسية لأي زائر (nearby-branches العام)،
            // مش بس على تسجيل/تحديث موقع مسجّل الدخول. info كانت تبقى آلاف السطور يوميًا فيها IP وموقع تقريبي للزوار
            Log::debug('geo.from_ip', ['ip' => $ip, 'lat' => $coordinates?->lat, 'lng' => $coordinates?->lng]);

            // VPN بيطلّع دولة تانية: منقبلش نقطة برا مصر
            if ($coordinates === null || ! EgyptBounds::contains($coordinates->lat, $coordinates->lng)) {
                return null;
            }

            $location = $this->nearest($coordinates->lat, $coordinates->lng, LocationSourceEnum::Ip);

            return ['city_id' => $location->cityId(), 'lat' => $location->lat, 'lng' => $location->lng];
        }, now()->addHours(24));

        if ($resolved === null) {
            return $this->fallback();
        }

        $city = GeoCity::find($resolved['city_id']);

        return $city !== null
            ? new ResolvedLocation($city, $resolved['lat'], $resolved['lng'], LocationSourceEnum::Ip)
            : $this->fallback();
    }

    public function fallback(): ResolvedLocation
    {
        $city = GeoCity::findOrFail(config('geo.default_city_id'));

        return new ResolvedLocation($city, $city->lat, $city->lng, LocationSourceEnum::Default);
    }
}
