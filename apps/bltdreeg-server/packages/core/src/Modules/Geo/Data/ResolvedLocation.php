<?php

namespace Bltdreeg\Core\Modules\Geo\Data;

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;

final readonly class ResolvedLocation
{
    public function __construct(
        public GeoArea $area,
        public float $lat,
        public float $lng,
        public LocationSourceEnum $source,
    ) {}

    public function governorateId(): string
    {
        return $this->area->governorate_id;
    }

    public function cityId(): string
    {
        return $this->area->city_id;
    }

    public function areaId(): string
    {
        return $this->area->id;
    }

    public function withSource(LocationSourceEnum $source): self
    {
        return new self($this->area, $this->lat, $this->lng, $source);
    }

    /**
     * @return array{governorate_id: string, city_id: string, area_id: string, last_lat: float, last_lng: float, location_source: int, location_updated_at: \Illuminate\Support\Carbon}
     */
    public function toCustomerColumns(): array
    {
        return [
            'governorate_id' => $this->governorateId(),
            'city_id' => $this->cityId(),
            'area_id' => $this->areaId(),
            'last_lat' => $this->lat,
            'last_lng' => $this->lng,
            'location_source' => $this->source->value,
            'location_updated_at' => now(),
        ];
    }

    /**
     * @return array{governorate_id: string, city_id: string, area_id: string, latitude: float, longitude: float, location_source: int}
     */
    public function toBranchColumns(): array
    {
        return [
            'governorate_id' => $this->governorateId(),
            'city_id' => $this->cityId(),
            'area_id' => $this->areaId(),
            'latitude' => $this->lat,
            'longitude' => $this->lng,
            'location_source' => $this->source->value,
        ];
    }
}
