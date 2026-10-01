<?php

namespace App\Modules\V1\Customer\Auth\Location\Data;

class Coordinates
{
    public function __construct(
        public readonly float $lat,
        public readonly float $lng,
    ) {}
}
