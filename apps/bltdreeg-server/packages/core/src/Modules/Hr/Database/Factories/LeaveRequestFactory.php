<?php

namespace Bltdreeg\Core\Modules\Hr\Database\Factories;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\LeaveRequest;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    protected $model = LeaveRequest::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('+1 week', '+8 weeks');

        return [
            'tenant_id' => Tenant::factory(),
            'user_id' => User::factory(),
            'type' => LeaveRequestTypeEnum::VACATION,
            'start_date' => $start,
            'end_date' => (clone $start)->modify('+'.fake()->numberBetween(0, 4).' days'),
            'reason' => $this->faker->sentence(),
            'status' => LeaveRequestStatusEnum::PENDING,
            'approved_by' => null,
            'approved_at' => null,
            'created_by' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => LeaveRequestStatusEnum::PENDING,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    public function approved(?User $approver = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => LeaveRequestStatusEnum::APPROVED,
            'approved_by' => $approver?->getKey(),
            'approved_at' => now(),
        ]);
    }

    public function rejected(?User $approver = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => LeaveRequestStatusEnum::REJECTED,
            'approved_by' => $approver?->getKey(),
            'approved_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => LeaveRequestStatusEnum::CANCELLED,
        ]);
    }
}
