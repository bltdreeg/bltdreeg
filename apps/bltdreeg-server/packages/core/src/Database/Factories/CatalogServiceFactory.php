<?php

namespace Bltdreeg\Core\Database\Factories;

use Bltdreeg\Core\Models\CatalogService;
use Bltdreeg\Core\Models\CatalogServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CatalogService>
 */
class CatalogServiceFactory extends Factory
{
    protected $model = CatalogService::class;

    public function definition(): array
    {
        return [
            'catalog_service_category_id' => CatalogServiceCategory::factory(),
            'name' => fake()->unique()->words(2, true),
            'description' => fake()->sentence(),
            'default_duration' => fake()->numberBetween(15, 90),
            'default_price' => fake()->randomFloat(2, 10, 200),
            'is_active' => true,
        ];
    }
}
