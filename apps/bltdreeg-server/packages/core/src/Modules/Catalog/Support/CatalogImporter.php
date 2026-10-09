<?php

namespace Bltdreeg\Core\Modules\Catalog\Support;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
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

    public function importService(CatalogService $catalog, Tenant $tenant): Service
    {
        $category = $this->importCategory($catalog->category, $tenant);

        return Service::query()->firstOrCreate(
            [
                'tenant_id' => $tenant->getKey(),
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
            ],
        );
    }

    public function importCatalog(Tenant $tenant): void
    {
        CatalogService::query()
            ->where('is_active', true)
            ->with('category')
            ->each(fn (CatalogService $service) => $this->importService($service, $tenant));

        CatalogJobType::query()
            ->where('is_active', true)
            ->each(fn (CatalogJobType $jobType) => $this->importJobType($jobType, $tenant));
    }
}
