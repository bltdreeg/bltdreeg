<?php

namespace App\Modules\V1\Geo\Http\Resources;

use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ResolvedLocation $resource
 */
class ResolvedLocationResource extends JsonResource
{
    /**
     * @return array{governorate: array{id: string, name: string}, city: array{id: string, name: string}, lat: float, lng: float, source: string}
     */
    public function toArray(Request $request): array
    {
        $city = $this->resource->city->loadMissing('governorate');
        $locale = app()->getLocale();

        return [
            'governorate' => ['id' => $city->governorate->id, 'name' => $city->governorate->getTranslation('name', $locale)],
            'city' => ['id' => $city->id, 'name' => $city->getTranslation('name', $locale)],
            'lat' => $this->resource->lat,
            'lng' => $this->resource->lng,
            'source' => $this->resource->source->label(),
        ];
    }
}
