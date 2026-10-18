<?php

namespace App\Modules\V1\Branches\Http\Controllers;

use App\Modules\V1\Branches\Http\Requests\BranchDetailRequest;
use App\Modules\V1\Branches\Http\Resources\BranchDetailResource;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Routing\Controller;

class BranchDetailController extends Controller
{
    /**
     * صفحة الصالون: بيانات الفرع والصور وخدمات الصالون. فرع مش ظاهر على الماركت = 404.
     */
    public function __invoke(BranchDetailRequest $request, int $branch): BranchDetailResource
    {
        $point = $request->point();

        $model = Branch::query()
            ->publiclyListed()
            ->when($point !== null, fn ($query) => $query->nearestTo($point[0], $point[1]))
            ->with([
                'tenant',
                'city',
                'governorate',
                'tenant.services' => fn ($services) => $services->withoutGlobalScopes()
                    ->where('is_active', true)
                    ->with(['category' => fn ($category) => $category->withoutGlobalScopes()])
                    ->orderBy('price'),
            ])
            ->findOrFail($branch);

        return new BranchDetailResource($model);
    }
}
