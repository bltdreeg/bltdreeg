<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Illuminate\Foundation\Testing\RefreshDatabase;

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
        ->assertJsonPath('location.area.id', 'EG011103');
});

test('estimate returns the ip location, or the default when ip is foreign', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();
    $this->actingAs($customer, 'customer');

    ipResolvesTo(new Coordinates(31.2001, 29.9187));
    $this->getJson('/api/v1/me/location/estimate')
        ->assertOk()->assertJsonPath('estimate.area.id', 'EG020405')->assertJsonPath('estimate.source', 'ip');

    ipResolvesTo(new Coordinates(51.5074, -0.1278));
    $this->getJson('/api/v1/me/location/estimate')
        ->assertOk()->assertJsonPath('estimate.area.id', 'EG011103')->assertJsonPath('estimate.source', 'default');
});

test('confirming with area and same-city gps keeps the gps point', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['area_id' => 'EG011102', 'lat' => 30.0444, 'lng' => 31.2357, 'source' => 'gps'])
        ->assertOk()
        ->assertJsonPath('location.area.id', 'EG011102')
        ->assertJsonPath('location.city.id', 'EG0111')
        ->assertJsonPath('location.lat', 30.0444)
        ->assertJsonPath('location.source', 'gps')
        ->assertJsonPath('location.confirmed', true)
        ->assertJsonPath('onboarding.complete', true);
});

test('confirming an area in another city replaces the point with its centroid', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();
    $area = GeoArea::query()->findOrFail('EG020405');

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['area_id' => 'EG020405', 'lat' => 30.0444, 'lng' => 31.2357, 'source' => 'ip'])
        ->assertOk()
        ->assertJsonPath('location.governorate.id', 'EG02')
        ->assertJsonPath('location.lat', $area->lat)
        ->assertJsonPath('location.source', 'manual');
});

test('unknown area is rejected', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['area_id' => 'EG999999'])
        ->assertStatus(422)->assertJsonValidationErrors(['area_id']);
});

test('automatic ip refresh never replaces a confirmed manual location', function () {
    $customer = Customer::factory()->inAlexandria()->create(['location_source' => LocationSourceEnum::Manual->value]);
    ipResolvesTo(new Coordinates(30.0444, 31.2357));

    $this->actingAs($customer, 'customer')->putJson('/api/v1/me/location', [])
        ->assertOk()->assertJsonPath('location.area.id', 'EG020405')->assertJsonPath('location.source', 'manual');
});

test('automatic gps refresh updates gps but not manual', function () {
    $gpsCustomer = Customer::factory()->create();
    $this->actingAs($gpsCustomer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 31.2001, 'lng' => 29.9187, 'source' => 'gps'])
        ->assertJsonPath('location.area.id', 'EG020405');

    $manualCustomer = Customer::factory()->create(['location_source' => LocationSourceEnum::Manual->value]);
    $this->actingAs($manualCustomer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 31.2001, 'lng' => 29.9187, 'source' => 'gps'])
        ->assertJsonPath('location.area.id', 'EG011103');
});

test('ip refresh upgrades a default location', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create(['location_source' => LocationSourceEnum::Default->value]);
    ipResolvesTo(new Coordinates(31.2001, 29.9187));

    $this->actingAs($customer, 'customer')->putJson('/api/v1/me/location', [])
        ->assertJsonPath('location.area.id', 'EG020405')->assertJsonPath('location.source', 'ip')
        ->assertJsonPath('location.confirmed', false);
});
