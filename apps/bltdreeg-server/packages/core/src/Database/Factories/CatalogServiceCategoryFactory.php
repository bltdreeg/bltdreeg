<?php

namespace Bltdreeg\Core\Database\Factories;

use Bltdreeg\Core\Models\CatalogServiceCategory;
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
