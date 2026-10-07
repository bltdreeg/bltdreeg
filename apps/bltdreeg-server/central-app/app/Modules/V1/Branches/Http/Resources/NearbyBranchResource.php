<?php

namespace App\Modules\V1\Branches\Http\Resources;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Branch $resource
 */
class NearbyBranchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $branch = $this->resource;
        $locale = app()->getLocale();

        return [
            'id' => $branch->id,
            'name' => $branch->getTranslation('name', $locale),
            'address' => $branch->getTranslation('address', $locale) ?: null,
            'salon' => ['id' => $branch->tenant->id, 'name' => $branch->tenant->name],
            'area' => ['id' => $branch->area->id, 'name' => $branch->area->getTranslation('name', $locale)],
            'city' => ['id' => $branch->city->id, 'name' => $branch->city->getTranslation('name', $locale)],
            'lat' => (float) $branch->latitude,
            'lng' => (float) $branch->longitude,
            'distance_km' => round(((float) $branch->getAttribute('distance_m')) / 1000, 1),
            'cover_image_url' => $branch->coverImageUrl(),
            'maps_url' => $branch->maps_url,
        ];
    }
}
