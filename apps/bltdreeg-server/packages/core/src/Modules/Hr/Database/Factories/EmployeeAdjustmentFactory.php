<?php

namespace Bltdreeg\Core\Modules\Hr\Database\Factories;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\EmployeeAdjustment;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmployeeAdjustment>
 */
class EmployeeAdjustmentFactory extends Factory
{
    protected $model = EmployeeAdjustment::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'user_id' => User::factory(),
            'type' => EmployeeAdjustmentTypeEnum::PENALTY,
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'reason' => $this->faker->sentence(),
            'effective_date' => $this->faker->date(),
            'status' => EmployeeAdjustmentStatusEnum::APPROVED,
            'approved_by' => null,
            'approved_at' => null,
            'created_by' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => EmployeeAdjustmentStatusEnum::APPROVED,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    public function approved(?User $approver = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => EmployeeAdjustmentStatusEnum::APPROVED,
            'approved_by' => $approver?->getKey(),
            'approved_at' => now(),
        ]);
    }

    public function applied(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => EmployeeAdjustmentStatusEnum::APPLIED,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => EmployeeAdjustmentStatusEnum::CANCELLED,
        ]);
    }
}
