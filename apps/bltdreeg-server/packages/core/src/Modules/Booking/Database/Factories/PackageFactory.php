<?php

namespace Bltdreeg\Core\Modules\Booking\Database\Factories;

use Bltdreeg\Core\Modules\Booking\Models\Package;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Package>
 */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'branch_id' => fn (array $attributes) => Branch::factory()->create([
                'tenant_id' => $attributes['tenant_id'],
            ])->getKey(),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 50, 400),
            'duration' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
