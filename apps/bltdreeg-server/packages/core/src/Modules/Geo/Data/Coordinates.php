<?php

namespace Bltdreeg\Core\Modules\Geo\Data;

final readonly class Coordinates
{
    public function __construct(
        public float $lat,
        public float $lng,
    ) {}
}
