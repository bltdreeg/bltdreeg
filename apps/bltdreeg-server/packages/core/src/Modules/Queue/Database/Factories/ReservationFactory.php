<?php

namespace Bltdreeg\Core\Modules\Queue\Database\Factories;

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationStatusEnum;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationTypeEnum;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * حجز في الطابور الحي (join_now/queued). الـ lines بتتضاف من الـ test لو محتاجها.
 *
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'chair_id' => Chair::factory(),
            'branch_id' => fn (array $attributes) => Chair::query()->findOrFail($attributes['chair_id'])->branch_id,
            'type' => ReservationTypeEnum::JoinNow,
            'status' => ReservationStatusEnum::Queued,
            'join_time' => now(),
        ];
    }

    public function inService(): static
    {
        return $this->state(fn () => ['status' => ReservationStatusEnum::InService, 'started_at' => now()]);
    }
}
