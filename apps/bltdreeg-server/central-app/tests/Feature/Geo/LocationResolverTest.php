<?php

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function fakeIp(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

test('nearest resolves a known point and keeps the exact point', function () {
    $location = app(LocationResolver::class)->nearest(30.0444, 31.2357, LocationSourceEnum::Gps);

    expect($location->areaId())->toBe('EG011103')
        ->and($location->cityId())->toBe('EG0111')
        ->and($location->governorateId())->toBe('EG01')
        ->and($location->lat)->toBe(30.0444)
        ->and($location->source)->toBe(LocationSourceEnum::Gps);
});

test('nearest resolves alexandria and a different cairo city', function () {
    $resolver = app(LocationResolver::class);

    expect($resolver->nearest(31.2001, 29.9187, LocationSourceEnum::Gps)->areaId())->toBe('EG020405')
        ->and($resolver->nearest(30.0626, 31.2497, LocationSourceEnum::Gps)->cityId())->toBe('EG0113');
});

test('fromIp uses the ip point', function () {
    fakeIp(new Coordinates(31.2001, 29.9187));

    $location = app(LocationResolver::class)->fromIp('41.32.0.1');

    expect($location->areaId())->toBe('EG020405')
        ->and($location->source)->toBe(LocationSourceEnum::Ip);
});

test('fromIp falls back to default for foreign ip, unknown ip and null ip', function (?Coordinates $coordinates, ?string $ip) {
    fakeIp($coordinates);

    $location = app(LocationResolver::class)->fromIp($ip);

    expect($location->areaId())->toBe('EG011103')
        ->and($location->source)->toBe(LocationSourceEnum::Default)
        ->and($location->lat)->toBe(GeoArea::query()->findOrFail('EG011103')->lat);
})->with([
    'london' => [new Coordinates(51.5074, -0.1278), '81.2.69.142'],
    'lookup failed' => [null, '41.32.0.1'],
    'no ip' => [null, null],
]);

test('forArea keeps the point when it is in the same city', function () {
    $location = app(LocationResolver::class)->forArea('EG011102', 30.0444, 31.2357, LocationSourceEnum::Gps);

    expect($location->areaId())->toBe('EG011102')
        ->and($location->lat)->toBe(30.0444)
        ->and($location->source)->toBe(LocationSourceEnum::Gps);
});

test('forArea moves to the area centroid when the point is in another city', function () {
    $location = app(LocationResolver::class)->forArea('EG020405', 30.0444, 31.2357, LocationSourceEnum::Gps);
    $area = GeoArea::query()->findOrFail('EG020405');

    expect($location->cityId())->toBe('EG0204')
        ->and($location->lat)->toBe($area->lat)
        ->and($location->lng)->toBe($area->lng)
        ->and($location->source)->toBe(LocationSourceEnum::Manual);
});

test('forArea without a point uses the centroid as manual', function () {
    $location = app(LocationResolver::class)->forArea('EG011102', null, null, LocationSourceEnum::Ip);

    expect($location->lat)->toBe(GeoArea::query()->findOrFail('EG011102')->lat)
        ->and($location->source)->toBe(LocationSourceEnum::Manual);
});

test('columns helpers', function () {
    $location = app(LocationResolver::class)->nearest(30.0444, 31.2357, LocationSourceEnum::Gps);

    expect($location->toCustomerColumns())->toMatchArray([
        'governorate_id' => 'EG01', 'city_id' => 'EG0111', 'area_id' => 'EG011103',
        'last_lat' => 30.0444, 'last_lng' => 31.2357, 'location_source' => 1,
    ])->and($location->toBranchColumns())->toMatchArray([
        'governorate_id' => 'EG01', 'city_id' => 'EG0111', 'area_id' => 'EG011103',
        'latitude' => 30.0444, 'longitude' => 31.2357, 'location_source' => 1,
    ]);
});
