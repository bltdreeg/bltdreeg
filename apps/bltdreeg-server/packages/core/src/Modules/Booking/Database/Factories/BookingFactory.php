<?php

namespace Bltdreeg\Core\Modules\Booking\Database\Factories;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $start = CarbonImmutable::tomorrow()->setTime(12, 0);

        return [
            'tenant_id' => Tenant::factory(),
            'branch_id' => fn (array $attributes) => Branch::factory()->create([
                'tenant_id' => $attributes['tenant_id'],
            ])->getKey(),
            'barber_user_id' => fn (array $attributes) => User::factory()->create([
                'branch_id' => $attributes['branch_id'],
            ])->getKey(),
            'customer_id' => null,
            'guest_name' => fake()->name(),
            'guest_phone' => '+201000000000',
            'source' => BookingSourceEnum::Dashboard,
            'status' => BookingStatusEnum::Confirmed,
            'starts_at' => $start,
            'ends_at' => $start->addMinutes(30),
            'duration_minutes' => 30,
            'gap_minutes' => 0,
            'total_price' => 100.00,
            'booking_code' => fn (): string => Str::upper(Str::random(3)).'-'.fake()->unique()->numberBetween(100, 999),
            'is_forced' => false,
        ];
    }
}
