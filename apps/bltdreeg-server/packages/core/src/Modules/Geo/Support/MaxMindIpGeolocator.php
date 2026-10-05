<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
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

        $dbPath = config('geo.maxmind_db_path');

        if (! is_string($dbPath) || ! file_exists($dbPath)) {
            return null;
        }

        try {
            $record = (new Reader($dbPath))->city($ip);

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
