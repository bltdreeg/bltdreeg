<?php

namespace Bltdreeg\Core\Database\Factories;

use Bltdreeg\Core\Models\RoleTemplate;
use Bltdreeg\Core\Support\TenantPermissions;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoleTemplate>
 */
class RoleTemplateFactory extends Factory
{
    protected $model = RoleTemplate::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'description' => fake()->sentence(),
            'permissions' => TenantPermissions::names(),
            'is_active' => true,
        ];
    }
}
