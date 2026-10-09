<?php

namespace App\Modules\V1\Geo\Http\Resources;

use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read GeoGovernorate|GeoCity $resource
 */
class GeoDivisionResource extends JsonResource
{
    /**
     * @return array{id: string, name: string, lat: float, lng: float}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->getTranslation('name', app()->getLocale()),
            'lat' => $this->resource->lat,
            'lng' => $this->resource->lng,
        ];
    }
}
