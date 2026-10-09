<?php

namespace Bltdreeg\Core\Modules\Catalog\Support;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;

class CatalogImporter
{
    public function importCategory(CatalogServiceCategory $catalog, Tenant $tenant): ServiceCategory
    {
        return ServiceCategory::query()->firstOrCreate(
            [
                'tenant_id' => $tenant->getKey(),
                'catalog_service_category_id' => $catalog->getKey(),
            ],
            [
                'name' => $catalog->getTranslations('name'),
                'description' => $catalog->getTranslations('description') ?: null,
                'is_active' => true,
            ],
        );
    }

    public function importService(CatalogService $catalog, Tenant $tenant, Branch $branch): Service
    {
        $category = $this->importCategory($catalog->category, $tenant);

        return Service::query()->withoutGlobalScopes()->firstOrCreate(
            [
                'tenant_id' => $tenant->getKey(),
                'branch_id' => $branch->getKey(),
                'catalog_service_id' => $catalog->getKey(),
            ],
            [
                'category_id' => $category->getKey(),
                'name' => $catalog->getTranslations('name'),
                'description' => $catalog->getTranslations('description') ?: null,
                'duration' => $catalog->default_duration,
                'price' => $catalog->default_price,
                'is_active' => true,
            ],
        );
    }

    public function importJobType(CatalogJobType $catalog, Tenant $tenant): JobType
    {
        return JobType::query()->firstOrCreate(
            [
                'tenant_id' => $tenant->getKey(),
                'catalog_job_type_id' => $catalog->getKey(),
            ],
            [
                'name' => $catalog->name,
                'description' => $catalog->description,
                'is_active' => true,
                'is_bookable' => (bool) $catalog->is_bookable,
            ],
        );
    }

    /**
     * A null branch imports into every branch of the tenant — what seeding and demo
     * data want. Job types stay tenant-level, so they are imported once either way.
     */
    public function importCatalog(Tenant $tenant, ?Branch $branch = null): void
    {
        $branches = $branch !== null
            ? collect([$branch])
            : Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->getKey())->get();

        CatalogService::query()
            ->where('is_active', true)
            ->with('category')
            ->each(function (CatalogService $service) use ($tenant, $branches): void {
                foreach ($branches as $target) {
                    $this->importService($service, $tenant, $target);
                }
            });

        CatalogJobType::query()
            ->where('is_active', true)
            ->each(fn (CatalogJobType $jobType) => $this->importJobType($jobType, $tenant));
    }
}
