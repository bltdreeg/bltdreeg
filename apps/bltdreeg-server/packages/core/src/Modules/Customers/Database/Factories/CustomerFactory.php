<?php

namespace Bltdreeg\Core\Modules\Customers\Database\Factories;

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'ulid' => (string) Str::ulid(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone' => '+2010'.fake()->numerify('########'),
            'phone_verified_at' => now(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => 'password123',
            'birth_date' => fake()->date('Y-m-d', '-18 years'),
            'last_lat' => 30.0444,
            'last_lng' => 31.2357,
            'location_source' => 1, // GPS
            'location_updated_at' => now(),
            'governorate_id' => 'EG01',
            'city_id' => 'EG0111',
            'location_confirmed_at' => now(),
            'terms_accepted_at' => now(),
            'terms_version' => '1.0',
            'locale' => 'ar',
            'is_active' => true,
        ];
    }

    public function unconfirmedLocation(): static
    {
        return $this->state(fn (array $attributes) => [
            'location_source' => 2, // IP
            'location_confirmed_at' => null,
        ]);
    }

    public function inAlexandria(): static
    {
        return $this->state(fn (array $attributes) => [
            'governorate_id' => 'EG02',
            'city_id' => 'EG0204',
            'last_lat' => 31.2001,
            'last_lng' => 29.9187,
        ]);
    }

    public function unverifiedPhone(): static
    {
        return $this->state(fn (array $attributes) => [
            'phone_verified_at' => null,
        ]);
    }

    public function unverifiedEmail(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function socialOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => null,
        ]);
    }

    public function incomplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'phone' => null,
            'phone_verified_at' => null,
            'first_name' => null,
            'last_name' => null,
            'terms_accepted_at' => null,
        ]);
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
