<?php

namespace App\Modules\V1\Branches\Http\Controllers;

use App\Modules\V1\Branches\Http\Requests\NearbyBranchesRequest;
use App\Modules\V1\Branches\Http\Resources\NearbyBranchResource;
use App\Modules\V1\Geo\Http\Resources\ResolvedLocationResource;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

class NearbyBranchesController extends Controller
{
    /**
     * Public list of branches, nearest first. With `lat`/`lng` the visitor's real position is
     * the origin (wherever they are); otherwise the request IP, then the default area.
     */
    public function __invoke(NearbyBranchesRequest $request, LocationResolver $resolver): AnonymousResourceCollection
    {
        $point = $request->point();
        $origin = $point !== null
            ? $resolver->nearest($point[0], $point[1], LocationSourceEnum::Gps)
            : $resolver->fromIp($request->ip());

        $branches = Branch::query()
            ->publiclyListed()
            ->nearestTo($origin->lat, $origin->lng)
            ->with(['tenant:id,name', 'city'])
            ->paginate($request->perPage())
            ->withQueryString();

        return NearbyBranchResource::collection($branches)->additional([
            'meta' => ['origin' => (new ResolvedLocationResource($origin))->resolve($request)],
        ]);
    }
}
