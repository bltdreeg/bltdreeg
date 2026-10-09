<?php

namespace Bltdreeg\Core\Modules\Booking\Database\Factories;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BarberSchedule>
 */
class BarberScheduleFactory extends Factory
{
    protected $model = BarberSchedule::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'branch_id' => fn (array $attributes) => Branch::factory()->create([
                'tenant_id' => $attributes['tenant_id'],
            ])->getKey(),
            'user_id' => fn (array $attributes) => User::factory()->create([
                'branch_id' => $attributes['branch_id'],
            ])->getKey(),
            'weekday' => 0,
            'start_time' => '10:00:00',
            'end_time' => '22:00:00',
            'is_active' => true,
        ];
    }
}
