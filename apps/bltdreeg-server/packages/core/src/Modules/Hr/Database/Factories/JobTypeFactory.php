<?php

namespace Bltdreeg\Core\Modules\Hr\Database\Factories;

use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobType>
 */
class JobTypeFactory extends Factory
{
    protected $model = JobType::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => fake()->unique()->jobTitle(),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
