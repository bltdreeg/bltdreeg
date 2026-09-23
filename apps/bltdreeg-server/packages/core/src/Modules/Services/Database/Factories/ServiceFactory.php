<?php

namespace Bltdreeg\Core\Modules\Services\Database\Factories;

use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'category_id' => ServiceCategory::factory(),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'duration' => fake()->numberBetween(30, 120),
            'price' => fake()->randomFloat(2, 10, 200),
            'is_active' => true,
        ];
    }
}
