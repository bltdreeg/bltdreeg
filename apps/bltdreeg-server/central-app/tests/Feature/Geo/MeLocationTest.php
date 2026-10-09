<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

function ipResolvesTo(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

test('new customer must confirm location before onboarding completes', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();

    $this->actingAs($customer, 'customer')->getJson('/api/v1/me')
        ->assertJsonPath('onboarding.complete', false)
        ->assertJsonPath('onboarding.missing', ['location'])
        ->assertJsonPath('location.confirmed', false)
        ->assertJsonPath('location.city.id', 'EG0111');
});

test('estimate returns the ip location, or the default when ip is foreign', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();
    $this->actingAs($customer, 'customer');

    ipResolvesTo(new Coordinates(31.2001, 29.9187));
    $this->getJson('/api/v1/me/location/estimate')
        ->assertOk()->assertJsonPath('estimate.city.id', 'EG0204')->assertJsonPath('estimate.source', 'ip');

    // IP lookups are cached by IP for 24h; flush so the second, different mocked result is actually used.
    Cache::flush();
    ipResolvesTo(new Coordinates(51.5074, -0.1278));
    $this->getJson('/api/v1/me/location/estimate')
        ->assertOk()->assertJsonPath('estimate.city.id', 'EG0111')->assertJsonPath('estimate.source', 'default');
});

test('confirming with a city and same-city gps keeps the gps point', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['city_id' => 'EG0111', 'lat' => 30.0444, 'lng' => 31.2357, 'source' => 'gps'])
        ->assertOk()
        ->assertJsonPath('location.city.id', 'EG0111')
        ->assertJsonPath('location.lat', 30.0444)
        ->assertJsonPath('location.source', 'gps')
        ->assertJsonPath('location.confirmed', true)
        ->assertJsonPath('onboarding.complete', true);
});

test('confirming a city with a point in another city replaces it with the centroid', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();
    $city = GeoCity::query()->findOrFail('EG0204');

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['city_id' => 'EG0204', 'lat' => 30.0444, 'lng' => 31.2357, 'source' => 'ip'])
        ->assertOk()
        ->assertJsonPath('location.governorate.id', 'EG02')
        ->assertJsonPath('location.lat', $city->lat)
        ->assertJsonPath('location.source', 'manual');
});

test('unknown city is rejected', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['city_id' => 'EG9999'])
        ->assertStatus(422)->assertJsonValidationErrors(['city_id']);
});

test('automatic ip refresh never replaces a confirmed manual location', function () {
    $customer = Customer::factory()->inAlexandria()->create(['location_source' => LocationSourceEnum::Manual->value]);
    ipResolvesTo(new Coordinates(30.0444, 31.2357));

    $this->actingAs($customer, 'customer')->putJson('/api/v1/me/location', [])
        ->assertOk()->assertJsonPath('location.city.id', 'EG0204')->assertJsonPath('location.source', 'manual');
});

test('automatic gps refresh updates gps but not manual', function () {
    $gpsCustomer = Customer::factory()->create();
    $this->actingAs($gpsCustomer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 31.2001, 'lng' => 29.9187, 'source' => 'gps'])
        ->assertJsonPath('location.city.id', 'EG0204');

    $manualCustomer = Customer::factory()->create(['location_source' => LocationSourceEnum::Manual->value]);
    $this->actingAs($manualCustomer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 31.2001, 'lng' => 29.9187, 'source' => 'gps'])
        ->assertJsonPath('location.city.id', 'EG0111');
});

test('ip refresh upgrades a default location', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create(['location_source' => LocationSourceEnum::Default->value]);
    ipResolvesTo(new Coordinates(31.2001, 29.9187));

    $this->actingAs($customer, 'customer')->putJson('/api/v1/me/location', [])
        ->assertJsonPath('location.city.id', 'EG0204')->assertJsonPath('location.source', 'ip')
        ->assertJsonPath('location.confirmed', false);
});
