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
     * @return array{governorate: array{id: string, name: string}, city: array{id: string, name: string}, area: array{id: string, name: string}, lat: float, lng: float, source: string}
     */
    public function toArray(Request $request): array
    {
        $area = $this->resource->area->loadMissing(['city', 'governorate']);
        $locale = app()->getLocale();

        return [
            'governorate' => ['id' => $area->governorate->id, 'name' => $area->governorate->getTranslation('name', $locale)],
            'city' => ['id' => $area->city->id, 'name' => $area->city->getTranslation('name', $locale)],
            'area' => ['id' => $area->id, 'name' => $area->getTranslation('name', $locale)],
            'lat' => $this->resource->lat,
            'lng' => $this->resource->lng,
            'source' => $this->resource->source->label(),
        ];
    }
}
