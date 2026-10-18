<?php

namespace Bltdreeg\Core\Modules\Queue\Database\Factories;

use Bltdreeg\Core\Modules\Queue\Enums\ChairStatusEnum;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chair>
 */
class ChairFactory extends Factory
{
    protected $model = Chair::class;

    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'position_no' => fn (array $attributes) => Chair::query()->where('branch_id', $attributes['branch_id'])->max('position_no') + 1,
            'status' => ChairStatusEnum::Active,
        ];
    }
}
