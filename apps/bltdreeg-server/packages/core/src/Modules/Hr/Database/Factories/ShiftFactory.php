<?php

namespace Bltdreeg\Core\Modules\Hr\Database\Factories;

use Bltdreeg\Core\Modules\Hr\Models\Shift;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Shift>
 */
class ShiftFactory extends Factory
{
    protected $model = Shift::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => $this->faker->randomElement(['Morning', 'Evening', 'Full day']),
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
            'break_minutes' => 30,
            'is_active' => true,
        ];
    }
}