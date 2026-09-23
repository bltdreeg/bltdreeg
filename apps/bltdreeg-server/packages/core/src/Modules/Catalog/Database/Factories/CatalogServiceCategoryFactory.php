<?php

namespace Bltdreeg\Core\Modules\Catalog\Database\Factories;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CatalogServiceCategory>
 */
class CatalogServiceCategoryFactory extends Factory
{
    protected $model = CatalogServiceCategory::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
