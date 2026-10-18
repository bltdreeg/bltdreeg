<?php

namespace App\Modules\V1\Branches\Http\Controllers;

use App\Modules\V1\Branches\Http\Requests\BranchFeedRequest;
use App\Modules\V1\Branches\Http\Resources\BranchFeedResource;
use App\Modules\V1\Branches\Support\BranchFeedQuery;
use App\Modules\V1\Geo\Http\Resources\ResolvedLocationResource;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

class BranchFeedController extends Controller
{
    /**
     * البحث والفلاتر. نفس origin بتاع nearby (الموقع ← الـ IP ← الافتراضي) للمسافة والترتيب.
     */
    public function __invoke(BranchFeedRequest $request, LocationResolver $resolver): AnonymousResourceCollection
    {
        $point = $request->point();
        $origin = $point !== null
            ? $resolver->nearest($point[0], $point[1], LocationSourceEnum::Gps)
            : $resolver->fromIp($request->ip());

        $branches = BranchFeedQuery::build($request, $origin->lat, $origin->lng)
            ->paginate($request->perPage())
            ->withQueryString();

        return BranchFeedResource::collection($branches)->additional([
            'meta' => ['origin' => (new ResolvedLocationResource($origin))->resolve($request)],
        ]);
    }
}
