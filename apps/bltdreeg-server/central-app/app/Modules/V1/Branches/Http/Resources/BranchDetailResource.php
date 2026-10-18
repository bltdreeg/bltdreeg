<?php

namespace App\Modules\V1\Branches\Http\Resources;

use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Branch $resource
 */
class BranchDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $branch = $this->resource;
        $locale = app()->getLocale();
        $services = $branch->tenant->services;
        $distance = $branch->getAttribute('distance_m');

        return [
            'id' => $branch->id,
            'name' => $branch->getTranslation('name', $locale),
            'address' => $branch->getTranslation('address', $locale) ?: null,
            'phone' => $branch->phone,
            'maps_url' => $branch->maps_url,
            'lat' => (float) $branch->latitude,
            'lng' => (float) $branch->longitude,
            'distance_km' => $distance === null ? null : round(((float) $distance) / 1000, 1),
            'salon' => [
                'id' => $branch->tenant->id,
                'name' => $branch->tenant->name,
                'website' => $branch->tenant->website,
            ],
            'city' => ['id' => $branch->city->id, 'name' => $branch->city->getTranslation('name', $locale)],
            'governorate' => [
                'id' => $branch->governorate->id,
                'name' => $branch->governorate->getTranslation('name', $locale),
            ],
            'cover_image_url' => $branch->coverImageUrl(),
            'images' => $branch->galleryUrls(),
            'currency' => $branch->currency->name,
            'price_from' => $services->isEmpty() ? null : (float) $services->min('price'),
            'service_categories' => $this->serviceCategories($services->all(), $locale),
        ];
    }

    /**
     * الخدمات متجمعة بالتصنيف بترتيب أول ظهور (الأرخص الأول)؛ الخدمة من غير تصنيف شغال تحت id = null.
     *
     * @param  list<Service>  $services
     * @return list<array<string, mixed>>
     */
    private function serviceCategories(array $services, string $locale): array
    {
        $groups = [];

        foreach ($services as $service) {
            $category = $service->category?->is_active ? $service->category : null;
            $key = $category?->id ?? 0;

            $groups[$key] ??= [
                'id' => $category?->id,
                'name' => $category?->getTranslation('name', $locale),
                'services' => [],
            ];

            $groups[$key]['services'][] = [
                'id' => $service->id,
                'name' => $service->getTranslation('name', $locale),
                'description' => $service->getTranslation('description', $locale) ?: null,
                'duration_minutes' => $service->duration,
                'price' => (float) $service->price,
            ];
        }

        return array_values($groups);
    }
}
