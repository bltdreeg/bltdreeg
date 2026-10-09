<?php

namespace Bltdreeg\Core\Modules\Geo\Data;

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Support\CurrencyResolver;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Illuminate\Support\Carbon;

final readonly class ResolvedLocation
{
    public function __construct(
        public GeoCity $city,
        public float $lat,
        public float $lng,
        public LocationSourceEnum $source,
    ) {}

    public function governorateId(): string
    {
        return $this->city->governorate_id;
    }

    public function cityId(): string
    {
        return $this->city->id;
    }

    public function withSource(LocationSourceEnum $source): self
    {
        return new self($this->city, $this->lat, $this->lng, $source);
    }

    /**
     * @return array{governorate_id: string, city_id: string, last_lat: float, last_lng: float, location_source: int, location_updated_at: Carbon}
     */
    public function toCustomerColumns(): array
    {
        return [
            'governorate_id' => $this->governorateId(),
            'city_id' => $this->cityId(),
            'last_lat' => $this->lat,
            'last_lng' => $this->lng,
            'location_source' => $this->source->value,
            'location_updated_at' => now(),
        ];
    }

    /**
     * @return array{governorate_id: string, city_id: string, latitude: float, longitude: float, location_source: int, currency: CurrencyEnum}
     */
    public function toBranchColumns(): array
    {
        return [
            'governorate_id' => $this->governorateId(),
            'city_id' => $this->cityId(),
            'latitude' => $this->lat,
            'longitude' => $this->lng,
            'location_source' => $this->source->value,
            'currency' => CurrencyResolver::forCoordinates($this->lat, $this->lng),
        ];
    }
}
