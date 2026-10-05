<?php

namespace App\Modules\V1\Customer\Auth\Location\Contracts;

use App\Modules\V1\Customer\Auth\Location\Data\Coordinates;

interface IpGeolocator
{
    public function locate(string $ip): ?Coordinates;
}
