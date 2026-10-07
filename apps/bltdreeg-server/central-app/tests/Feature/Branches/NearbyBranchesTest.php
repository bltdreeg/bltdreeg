<?php

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function nearbyIpResolvesTo(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

function cairoBranch(array $attributes = []): Branch
{
    return Branch::factory()->create($attributes); // الـ factory في القاهرة (EG011103)
}

function alexandriaBranch(array $attributes = []): Branch
{
    return Branch::factory()->create([
        'latitude' => 31.2001,
        'longitude' => 29.9187,
        'governorate_id' => 'EG02',
        'city_id' => 'EG0204',
        'area_id' => 'EG020405',
        ...$attributes,
    ]);
}

test('orders branches by distance from the given coordinates', function () {
    $cairo = cairoBranch();
    $alexandria = alexandriaBranch();

    $this->getJson('/api/v1/branches/nearby?lat=31.2001&lng=29.9187', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.0.id', $alexandria->id)
        ->assertJsonPath('data.0.distance_km', 0)
        ->assertJsonPath('data.1.id', $cairo->id)
        ->assertJsonPath('meta.origin.source', 'gps')
        ->assertJsonPath('meta.origin.area.id', 'EG020405');
});

test('without coordinates the origin comes from the ip', function () {
    nearbyIpResolvesTo(new Coordinates(lat: 30.0444, lng: 31.2357));
    $cairo = cairoBranch();
    alexandriaBranch();

    $this->getJson('/api/v1/branches/nearby')
        ->assertOk()
        ->assertJsonPath('data.0.id', $cairo->id)
        ->assertJsonPath('meta.origin.source', 'ip');
});

test('coordinates outside egypt fall back to ip', function () {
    nearbyIpResolvesTo(new Coordinates(lat: 31.2001, lng: 29.9187));
    cairoBranch();
    $alexandria = alexandriaBranch();

    $this->getJson('/api/v1/branches/nearby?lat=51.5&lng=-0.12')
        ->assertOk()
        ->assertJsonPath('data.0.id', $alexandria->id)
        ->assertJsonPath('meta.origin.source', 'ip');
});

test('unknown ip falls back to the default area', function () {
    nearbyIpResolvesTo(null);
    cairoBranch();

    $this->getJson('/api/v1/branches/nearby')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.origin.source', 'default');
});

test('only lists active branches of approved active tenants', function () {
    $visible = cairoBranch();
    cairoBranch(['is_active' => false]);
    cairoBranch(['tenant_id' => Tenant::factory()->draft()]);
    cairoBranch(['tenant_id' => Tenant::factory()->state(['is_active' => false])]);

    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $visible->id);
});

test('paginates with per_page', function () {
    cairoBranch();
    cairoBranch(['latitude' => 30.06, 'longitude' => 31.25]);
    $farthest = alexandriaBranch();

    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357&per_page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('meta.total', 3);

    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357&per_page=2&page=2')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $farthest->id);
});

test('localizes branch, area and city names', function () {
    cairoBranch(['name' => ['en' => 'Maadi', 'ar' => 'فرع المعادي']]);

    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357', ['Accept-Language' => 'ar'])
        ->assertJsonPath('data.0.name', 'فرع المعادي');
    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357', ['Accept-Language' => 'en'])
        ->assertJsonPath('data.0.name', 'Maadi')
        ->assertJsonPath('data.0.city.name', 'Qasr Al-Nile');
});

test('rejects half coordinates and oversized pages', function () {
    $this->getJson('/api/v1/branches/nearby?lat=30.0')->assertStatus(422)->assertJsonValidationErrors(['lng']);
    $this->getJson('/api/v1/branches/nearby?per_page=100')->assertStatus(422)->assertJsonValidationErrors(['per_page']);
});
