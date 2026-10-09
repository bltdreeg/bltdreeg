<?php

namespace Bltdreeg\Core\Modules\Catalog\Support;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantSeeder;

class Catalog
{
    /**
     * @var array<string, array{name: array<string, string>, description: array<string, string>}>
     */
    public const CATEGORIES = [
        'hair' => [
            'name' => ['en' => 'Hair', 'ar' => 'الشعر'],
            'description' => ['en' => 'Cuts, color, and styling', 'ar' => 'قص وصبغ وتصفيف'],
        ],
        'nails' => [
            'name' => ['en' => 'Nails', 'ar' => 'الأظافر'],
            'description' => ['en' => 'Manicure and pedicure', 'ar' => 'مانيكير وباديكير'],
        ],
        'skin' => [
            'name' => ['en' => 'Skin care', 'ar' => 'العناية بالبشرة'],
            'description' => ['en' => 'Facials and treatments', 'ar' => 'تنظيف وعلاجات البشرة'],
        ],
    ];

    /**
     * @var list<array{category: string, name: array<string, string>, description: array<string, string>, duration: int, price: int}>
     */
    public const SERVICES = [
        ['category' => 'hair', 'name' => ['en' => 'Haircut', 'ar' => 'قص الشعر'], 'description' => ['en' => 'Haircut', 'ar' => 'قص الشعر'], 'duration' => 45, 'price' => 40],
        ['category' => 'hair', 'name' => ['en' => 'Hair coloring', 'ar' => 'صبغ الشعر'], 'description' => ['en' => 'Hair coloring', 'ar' => 'صبغ الشعر'], 'duration' => 90, 'price' => 80],
        ['category' => 'hair', 'name' => ['en' => 'Blow dry', 'ar' => 'سشوار'], 'description' => ['en' => 'Blow dry', 'ar' => 'سشوار'], 'duration' => 30, 'price' => 25],
        ['category' => 'nails', 'name' => ['en' => 'Manicure', 'ar' => 'مانيكير'], 'description' => ['en' => 'Manicure', 'ar' => 'مانيكير'], 'duration' => 40, 'price' => 30],
        ['category' => 'nails', 'name' => ['en' => 'Pedicure', 'ar' => 'باديكير'], 'description' => ['en' => 'Pedicure', 'ar' => 'باديكير'], 'duration' => 50, 'price' => 35],
        ['category' => 'skin', 'name' => ['en' => 'Facial', 'ar' => 'تنظيف البشرة'], 'description' => ['en' => 'Facial', 'ar' => 'تنظيف البشرة'], 'duration' => 60, 'price' => 55],
    ];

    public static function seed(): void
    {
        $categories = array_map(
            fn (array $category): CatalogServiceCategory => self::category($category['name'], $category['description']),
            self::CATEGORIES,
        );

        foreach (self::SERVICES as $service) {
            CatalogService::query()->where('name->en', $service['name']['en'])->firstOr(
                fn () => CatalogService::query()->create([
                    'name' => $service['name'],
                    'catalog_service_category_id' => $categories[$service['category']]->id,
                    'description' => $service['description'],
                    'default_duration' => $service['duration'],
                    'default_price' => $service['price'],
                    'is_active' => true,
                ]),
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

    /**
     * @param  array<string, string>  $name
     * @param  array<string, string>  $description
     */
    private static function category(array $name, array $description): CatalogServiceCategory
    {
        return CatalogServiceCategory::query()->where('name->en', $name['en'])->firstOr(
            fn () => CatalogServiceCategory::query()->create([
                'name' => $name,
                'description' => $description,
                'is_active' => true,
            ]),
        );
    }
}
