<?php

namespace Database\Factories;

use Bltdreeg\Core\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'slug' => fake()->slug(),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'logo' => null,
            'address' => fake()->address(),
            'currency' => fake()->numberBetween(1, 4),
            'is_active' => true,
        ];
    }
}
