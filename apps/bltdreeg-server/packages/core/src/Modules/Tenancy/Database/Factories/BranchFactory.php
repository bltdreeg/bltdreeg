<?php

namespace Bltdreeg\Core\Modules\Tenancy\Database\Factories;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
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
            'latitude' => 30.0444,
            'longitude' => 31.2357,
            'governorate_id' => 'EG01',
            'city_id' => 'EG0111',
            'location_source' => 3, // Manual
            'is_active' => true,
        ];
    }
}
