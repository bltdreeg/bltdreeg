<?php

namespace App\Modules\V1\Geo\Http\Controllers;

use App\Modules\V1\Geo\Http\Resources\GeoDivisionResource;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class GeoDivisionsController extends Controller
{
    public function governorates(Request $request): JsonResponse
    {
        return $this->sorted($request, GeoGovernorate::query()->get());
    }

    public function cities(Request $request, GeoGovernorate $governorate): JsonResponse
    {
        return $this->sorted($request, $governorate->cities()->get());
    }

    /**
     * @param  Collection<int, GeoGovernorate|GeoCity>  $divisions
     */
    private function sorted(Request $request, Collection $divisions): JsonResponse
    {
        $locale = app()->getLocale();

        $sorted = $divisions
            ->sortBy(fn (GeoGovernorate|GeoCity $division): string => $division->getTranslation('name', $locale))
            ->values();

        // JsonResource::withoutWrapping() is global for the customer API, so the envelope is explicit here
        return response()->json(['data' => GeoDivisionResource::collection($sorted)->resolve($request)]);
    }
}
