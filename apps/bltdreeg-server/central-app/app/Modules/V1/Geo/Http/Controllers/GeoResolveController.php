<?php

namespace App\Modules\V1\Geo\Http\Controllers;

use App\Modules\V1\Geo\Http\Requests\ResolvePointRequest;
use App\Modules\V1\Geo\Http\Resources\ResolvedLocationResource;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class GeoResolveController extends Controller
{
    public function __invoke(ResolvePointRequest $request, LocationResolver $resolver): JsonResponse
    {
        $location = $resolver->nearest((float) $request->input('lat'), (float) $request->input('lng'), LocationSourceEnum::Gps);

        return response()->json(['data' => (new ResolvedLocationResource($location))->resolve($request)]);
    }
}
