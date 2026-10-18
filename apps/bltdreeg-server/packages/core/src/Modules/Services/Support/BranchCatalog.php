<?php

namespace Bltdreeg\Core\Modules\Services\Support;

use Bltdreeg\Core\Modules\Services\Models\BranchService;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Support\Collection;

/**
 * القيم الفعلية لخدمات فرع (ADR 0003): خدمة الصالون الشغالة + override الفرع لو موجود.
 * أي سعر/مدة بيتعرضوا للعميل أو بيتحجزوا لازم يعدّوا من هنا.
 */
class BranchCatalog
{
    /**
     * @return Collection<int, array{service: Service, price: float, duration: int}> keyed by service id, cheapest first
     */
    public static function effective(Branch $branch): Collection
    {
        $overrides = BranchService::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->id)
            ->get()
            ->keyBy('service_id');

        return Service::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $branch->tenant_id)
            ->where('is_active', true)
            ->with(['category' => fn ($category) => $category->withoutGlobalScopes()])
            ->get()
            ->reject(fn (Service $service) => $overrides->get($service->id)?->is_active === false)
            ->map(function (Service $service) use ($overrides): array {
                $override = $overrides->get($service->id);

                return [
                    'service' => $service,
                    'price' => (float) ($override?->price ?? $service->price),
                    'duration' => (int) ($override?->duration ?? $service->duration),
                ];
            })
            ->sortBy('price')
            ->keyBy(fn (array $entry) => $entry['service']->id);
    }
}
