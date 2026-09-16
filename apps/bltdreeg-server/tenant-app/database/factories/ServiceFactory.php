<?php

namespace Database\Factories;

use Bltdreeg\Core\Models\Service;
use Bltdreeg\Core\Models\ServiceCategory;
use Bltdreeg\Core\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'category_id' => ServiceCategory::factory(),
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->text(),
            'duration' => $this->faker->numberBetween(30, 120),
            'price' => $this->faker->randomFloat(2, 10, 200),
            'is_active' => true,
        ];
    }
}
