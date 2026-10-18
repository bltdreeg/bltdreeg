<?php

namespace Bltdreeg\Core\Modules\Queue\Database\Factories;

use Bltdreeg\Core\Modules\Queue\Models\BarberProfile;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BarberProfile>
 */
class BarberProfileFactory extends Factory
{
    protected $model = BarberProfile::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => fake()->name(),
            'is_active' => true,
            'leaving_status' => 'active',
        ];
    }

    /** حلاق كرسيه الافتراضي الكرسي ده (ومن نفس صالون الفرع) */
    public function forChair(Chair $chair): static
    {
        return $this->state(fn () => [
            'tenant_id' => $chair->branch->tenant_id,
            'default_chair_id' => $chair->id,
        ]);
    }
}
