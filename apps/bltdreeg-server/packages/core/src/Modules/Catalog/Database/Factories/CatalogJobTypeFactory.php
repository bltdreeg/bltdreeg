<?php

namespace Bltdreeg\Core\Modules\Catalog\Database\Factories;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CatalogJobType>
 */
class CatalogJobTypeFactory extends Factory
{
    protected $model = CatalogJobType::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->jobTitle(),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
