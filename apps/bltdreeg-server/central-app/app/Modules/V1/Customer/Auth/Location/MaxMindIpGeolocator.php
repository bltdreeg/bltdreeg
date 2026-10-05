<?php

namespace App\Modules\V1\Customer\Auth\Location;

use App\Modules\V1\Customer\Auth\Location\Contracts\IpGeolocator;
use App\Modules\V1\Customer\Auth\Location\Data\Coordinates;
use GeoIp2\Database\Reader;
use Throwable;

class MaxMindIpGeolocator implements IpGeolocator
{
    public function locate(string $ip): ?Coordinates
    {
        // Ignore loopback and private ranges
        if ($ip === '127.0.0.1' || $ip === '::1' || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
            return null;
        }

        $dbPath = config('customer_auth.location.maxmind_db_path', database_path('geoip/GeoLite2-City.mmdb'));

        if (! file_exists($dbPath)) {
            return null;
        }

        try {
            $reader = new Reader($dbPath);
            $record = $reader->city($ip);

            $lat = $record->location->latitude;
            $lng = $record->location->longitude;

            if ($lat !== null && $lng !== null) {
                return new Coordinates((float) $lat, (float) $lng);
            }
        } catch (Throwable) {
            return null;
        }

        return null;
    }
}
