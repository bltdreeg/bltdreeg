<?php

namespace Bltdreeg\Core\Modules\Geo\Contracts;

use Bltdreeg\Core\Modules\Geo\Data\Coordinates;

interface IpGeolocator
{
    public function locate(string $ip): ?Coordinates;
}
