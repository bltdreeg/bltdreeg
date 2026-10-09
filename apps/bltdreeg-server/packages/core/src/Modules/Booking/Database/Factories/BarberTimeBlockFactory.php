<?php

namespace Bltdreeg\Core\Modules\Booking\Database\Factories;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BarberTimeBlock>
 */
class BarberTimeBlockFactory extends Factory
{
    protected $model = BarberTimeBlock::class;

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
            'starts_at' => now()->addDay()->setTime(12, 0),
            'ends_at' => now()->addDay()->setTime(13, 0),
            'is_full_day' => false,
            'reason' => null,
        ];
    }
}
