<?php

namespace Bltdreeg\Core\Support;

use Bltdreeg\Core\Models\CatalogJobType;
use Bltdreeg\Core\Models\CatalogService;
use Bltdreeg\Core\Models\CatalogServiceCategory;
use Bltdreeg\Core\Models\RoleTemplate;

class Catalog
{
    public static function seed(): void
    {
        app(TenantProvisioner::class)->ensurePermissions();

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

        RoleTemplate::query()->updateOrCreate(
            ['name' => 'Owner'],
            [
                'description' => 'Full access to the salon',
                'permissions' => TenantPermissions::names(),
                'is_active' => true,
            ],
        );

        RoleTemplate::query()->updateOrCreate(
            ['name' => 'Manager'],
            [
                'description' => 'Manage staff, services, and roles',
                'permissions' => TenantPermissions::names(),
                'is_active' => true,
            ],
        );

        RoleTemplate::query()->firstOrCreate(
            ['name' => 'Staff'],
            [
                'description' => 'View services and categories',
                'permissions' => [
                    'services.index',
                    'services.view',
                    'categories.index',
                    'categories.view',
                ],
                'is_active' => true,
            ],
        );
    }
}
