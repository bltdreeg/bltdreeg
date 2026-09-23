<?php

namespace Database\Factories;

use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceCategory>
 */
class ServiceCategoryFactory extends Factory
{
    protected $model = ServiceCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'is_active' => $this->faker->boolean(),
        ];
    }
}
