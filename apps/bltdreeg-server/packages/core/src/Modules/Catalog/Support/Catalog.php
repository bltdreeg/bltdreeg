<?php

namespace Bltdreeg\Core\Modules\Catalog\Support;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantSeeder;

class Catalog
{
    public static function seed(): void
    {
        $hair = CatalogServiceCategory::query()->firstOrCreate(
            ['name' => 'Hair'],
            ['description' => 'Cuts, color, and styling', 'is_active' => true],
        );
        $nails = CatalogServiceCategory::query()->firstOrCreate(
            ['name' => 'Nails'],
            ['description' => 'Manicure and pedicure', 'is_active' => true],
        );
        $skin = CatalogServiceCategory::query()->firstOrCreate(
            ['name' => 'Skin care'],
            ['description' => 'Facials and treatments', 'is_active' => true],
        );

        $services = [
            ['category' => $hair, 'name' => 'Haircut', 'duration' => 45, 'price' => 40],
            ['category' => $hair, 'name' => 'Hair coloring', 'duration' => 90, 'price' => 80],
            ['category' => $hair, 'name' => 'Blow dry', 'duration' => 30, 'price' => 25],
            ['category' => $nails, 'name' => 'Manicure', 'duration' => 40, 'price' => 30],
            ['category' => $nails, 'name' => 'Pedicure', 'duration' => 50, 'price' => 35],
            ['category' => $skin, 'name' => 'Facial', 'duration' => 60, 'price' => 55],
        ];

        foreach ($services as $service) {
            CatalogService::query()->firstOrCreate(
                ['name' => $service['name']],
                [
                    'catalog_service_category_id' => $service['category']->id,
                    'description' => $service['name'],
                    'default_duration' => $service['duration'],
                    'default_price' => $service['price'],
                    'is_active' => true,
                ],
            );
        }

        foreach ([
            ['name' => 'Hair stylist', 'description' => 'Cuts and styles hair'],
            ['name' => TenantSeeder::BARBER_JOB_TYPE, 'description' => 'Cuts hair and trims beards'],
            ['name' => 'Nail technician', 'description' => 'Manicures and pedicures'],
            ['name' => 'Esthetician', 'description' => 'Skin treatments'],
            ['name' => 'Receptionist', 'description' => 'Front desk'],
            ['name' => 'Salon manager', 'description' => 'Runs the salon floor'],
        ] as $jobType) {
            CatalogJobType::query()->firstOrCreate(
                ['name' => $jobType['name']],
                ['description' => $jobType['description'], 'is_active' => true],
            );
        }
    }
}
