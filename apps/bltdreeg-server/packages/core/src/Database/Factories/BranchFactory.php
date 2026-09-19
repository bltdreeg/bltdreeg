<?php

namespace Bltdreeg\Core\Database\Factories;

use Bltdreeg\Core\Models\Branch;
use Bltdreeg\Core\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Branch>
 */
class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        $city = $this->faker->city();

        return [
            'tenant_id' => Tenant::factory(),
            'name' => ['en' => $city, 'ar' => 'فرع '.$city],
            'phone' => $this->faker->phoneNumber(),
            'address' => ['en' => $this->faker->address(), 'ar' => $this->faker->address()],
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'is_active' => true,
        ];
    }
}
