<?php

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn(new Coordinates(lat: 30.0444, lng: 31.2357));
    app()->instance(IpGeolocator::class, $geolocator);
});

/**
 * @param  array<string, mixed>  $attributes
 */
function feedService(Tenant $tenant, float $price, array $attributes = []): Service
{
    return Service::factory()->create([
        'tenant_id' => $tenant->id,
        'category_id' => ServiceCategory::factory()->create(['tenant_id' => $tenant->id])->id,
        'name' => ['ar' => 'قص شعر', 'en' => 'Haircut'],
        'price' => $price,
        ...$attributes,
    ]);
}

test('lists public branches with price from and service names', function () {
    $branch = Branch::factory()->create();
    feedService($branch->tenant, 120);
    feedService($branch->tenant, 60, ['name' => ['ar' => 'تحديد دقن', 'en' => 'Beard trim']]);
    feedService($branch->tenant, 10, ['is_active' => false]);

    $this->getJson('/api/v1/branches', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $branch->id)
        ->assertJsonPath('data.0.price_from', 60)
        ->assertJsonPath('data.0.currency', 'EGP')
        ->assertJsonPath('data.0.services', ['Beard trim', 'Haircut'])
        ->assertJsonPath('data.0.is_new', true)
        ->assertJsonPath('meta.origin.source', 'ip')
        ->assertJsonStructure(['data' => [['distance_km', 'cover_image_url', 'salon' => ['id', 'name']]], 'meta' => ['total']]);
});

test('a branch without active services has a null price from', function () {
    Branch::factory()->create();

    $this->getJson('/api/v1/branches')
        ->assertOk()
        ->assertJsonPath('data.0.price_from', null)
        ->assertJsonPath('data.0.services', []);
});

test('hides inactive branches and branches of unapproved salons', function () {
    $visible = Branch::factory()->create();
    Branch::factory()->create(['is_active' => false]);
    Branch::factory()->create(['tenant_id' => Tenant::factory()->draft()]);

    $this->getJson('/api/v1/branches')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $visible->id);
});

test('searches branch name, salon name and service names', function () {
    $byBranch = Branch::factory()->create(['name' => ['ar' => 'فرع المعادي', 'en' => 'Maadi']]);
    $bySalon = Branch::factory()->create(['tenant_id' => Tenant::factory()->state(['name' => 'Barber Lounge'])]);
    $byService = Branch::factory()->create();
    feedService($byService->tenant, 80, ['name' => ['ar' => 'صبغة', 'en' => 'Hair color']]);
    Branch::factory()->create(['name' => ['ar' => 'فرع تاني', 'en' => 'Other']]);

    $ids = fn (string $q) => collect($this->getJson('/api/v1/branches?q='.urlencode($q))->assertOk()->json('data'))->pluck('id')->all();

    expect($ids('المعادي'))->toBe([$byBranch->id])
        ->and($ids('Lounge'))->toBe([$bySalon->id])
        ->and($ids('صبغة'))->toBe([$byService->id])
        ->and($ids('maadi'))->toBe([$byBranch->id])
        ->and($ids('hair COLOR'))->toBe([$byService->id]);
});

test('search treats like wildcards literally', function () {
    Branch::factory()->create(['name' => ['ar' => 'فرع', 'en' => 'Branch']]);

    $this->getJson('/api/v1/branches?q='.urlencode('%'))
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

test('filters by governorate, city and max price', function () {
    $cairo = Branch::factory()->create();
    feedService($cairo->tenant, 150);
    $alexandria = Branch::factory()->create([
        'latitude' => 31.2001, 'longitude' => 29.9187, 'governorate_id' => 'EG02', 'city_id' => 'EG0204',
    ]);
    feedService($alexandria->tenant, 50);

    $this->getJson('/api/v1/branches?governorate_id=EG02')
        ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $alexandria->id);
    $this->getJson('/api/v1/branches?city_id=EG0111')
        ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $cairo->id);
    $this->getJson('/api/v1/branches?max_price=100')
        ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $alexandria->id);
});

test('sorts by nearest, price and newest', function () {
    $near = Branch::factory()->create();
    feedService($near->tenant, 200);
    $far = Branch::factory()->create([
        'latitude' => 31.2001, 'longitude' => 29.9187, 'governorate_id' => 'EG02', 'city_id' => 'EG0204',
    ]);
    feedService($far->tenant, 40);
    $noServices = Branch::factory()->create();
    $near->forceFill(['created_at' => now()->subYear()])->save();

    $ids = fn (string $sort) => collect($this->getJson("/api/v1/branches?sort={$sort}")->json('data'))->pluck('id')->all();

    expect($ids('nearest'))->toBe([$near->id, $noServices->id, $far->id])
        ->and($ids('price'))->toBe([$far->id, $near->id, $noServices->id])
        ->and($ids('newest')[2])->toBe($near->id);
});

test('rejects an unknown sort', function () {
    $this->getJson('/api/v1/branches?sort=rating')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('sort');
});

test('the site root is not routed to the branch list', function () {
    $this->getJson('/')->assertJsonMissingPath('meta.origin');
});
