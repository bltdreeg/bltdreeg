<?php

namespace App\Modules\V1\Branches\Http\Resources;

use Illuminate\Http\Request;

/**
 * عنصر في نتايج البحث: نفس كارت nearby + السعر وأسماء الخدمات للكارت.
 */
class BranchFeedResource extends NearbyBranchResource
{
    public const SERVICE_NAMES_LIMIT = 4;

    public const NEW_FOR_DAYS = 30;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $branch = $this->resource;
        $locale = app()->getLocale();
        $priceFrom = $branch->getAttribute('price_from');

        return [
            ...parent::toArray($request),
            'price_from' => $priceFrom === null ? null : (float) $priceFrom,
            'currency' => $branch->currency->name,
            'services' => $branch->tenant->services
                ->take(self::SERVICE_NAMES_LIMIT)
                ->map(fn ($service) => $service->getTranslation('name', $locale))
                ->values(),
            'is_new' => $branch->created_at?->gt(now()->subDays(self::NEW_FOR_DAYS)) ?? false,
        ];
    }
}
