<?php

use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('returns the branch with gallery and services grouped by category', function () {
    Storage::fake(Branch::IMAGES_DISK);
    $branch = Branch::factory()->create([
        'name' => ['ar' => 'فرع المعادي', 'en' => 'Maadi'],
        'cover_image' => 'branches/cover.jpg',
        'images' => ['branches/cover.jpg', 'branches/inside.jpg'],
    ]);
    $tenant = $branch->tenant;
    $hair = ServiceCategory::factory()->create(['tenant_id' => $tenant->id, 'name' => ['ar' => 'شعر', 'en' => 'Hair']]);
    $beard = ServiceCategory::factory()->create(['tenant_id' => $tenant->id, 'name' => ['ar' => 'دقن', 'en' => 'Beard']]);
    $haircut = Service::factory()->create([
        'tenant_id' => $tenant->id, 'category_id' => $hair->id,
        'name' => ['ar' => 'قص شعر', 'en' => 'Haircut'], 'description' => ['en' => 'Scissors cut'],
        'duration' => 30, 'price' => 120,
    ]);
    Service::factory()->create([
        'tenant_id' => $tenant->id, 'category_id' => $beard->id,
        'name' => ['ar' => 'تحديد دقن', 'en' => 'Beard trim'], 'duration' => 20, 'price' => 60,
    ]);
    Service::factory()->create(['tenant_id' => $tenant->id, 'category_id' => $hair->id, 'is_active' => false]);

    $response = $this->getJson("/api/v1/branches/{$branch->id}", ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('id', $branch->id)
        ->assertJsonPath('name', 'Maadi')
        ->assertJsonPath('salon.id', $tenant->id)
        ->assertJsonPath('city.id', 'EG0111')
        ->assertJsonPath('governorate.id', 'EG01')
        ->assertJsonPath('distance_km', null)
        ->assertJsonPath('currency', 'EGP')
        ->assertJsonPath('price_from', 60)
        ->assertJsonCount(2, 'images')
        ->assertJsonCount(2, 'service_categories')
        ->assertJsonPath('service_categories.0.name', 'Beard')
        ->assertJsonPath('service_categories.1.name', 'Hair')
        ->assertJsonPath('service_categories.1.services', [[
            'id' => $haircut->id,
            'name' => 'Haircut',
            'description' => 'Scissors cut',
            'duration_minutes' => 30,
            'price' => 120,
        ]]);

    expect($response->json('images.0'))->toEndWith('branches/cover.jpg');
});

test('includes the distance when the visitor position is sent', function () {
    $branch = Branch::factory()->create();

    $this->getJson("/api/v1/branches/{$branch->id}?lat=30.0444&lng=31.2357")
        ->assertOk()
        ->assertJsonPath('distance_km', 0);
});

test('a branch hidden from the marketplace is not found', function () {
    $inactive = Branch::factory()->create(['is_active' => false]);
    $draftSalon = Branch::factory()->create(['tenant_id' => Tenant::factory()->draft()]);

    $this->getJson("/api/v1/branches/{$inactive->id}")->assertNotFound();
    $this->getJson("/api/v1/branches/{$draftSalon->id}")->assertNotFound();
    $this->getJson('/api/v1/branches/999999')->assertNotFound();
});

test('services of another salon are not included', function () {
    $branch = Branch::factory()->create();
    $other = Branch::factory()->create();
    Service::factory()->create([
        'tenant_id' => $other->tenant_id,
        'category_id' => ServiceCategory::factory()->create(['tenant_id' => $other->tenant_id])->id,
    ]);

    $this->getJson("/api/v1/branches/{$branch->id}")
        ->assertOk()
        ->assertJsonPath('service_categories', [])
        ->assertJsonPath('price_from', null);
});
