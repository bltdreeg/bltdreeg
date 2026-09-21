<?php

namespace Bltdreeg\Core\Database\Factories;

use Bltdreeg\Core\Models\EmployeeAttendance;
use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmployeeAttendance>
 */
class EmployeeAttendanceFactory extends Factory
{
    protected $model = EmployeeAttendance::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'user_id' => User::factory(),
            'branch_id' => null,
            'date' => $this->faker->date(),
            'check_in' => null,
            'check_out' => null,
            'worked_minutes' => null,
            'late_minutes' => 0,
            'overtime_minutes' => 0,
            'status' => 1,
            'notes' => null,
        ];
    }
}