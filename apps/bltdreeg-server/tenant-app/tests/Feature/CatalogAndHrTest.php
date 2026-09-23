<?php

use App\Support\CatalogImporter;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchSelection;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('importing a catalog service copies defaults onto the tenant', function () {
    $tenant = Tenant::factory()->create();
    $catalog = CatalogService::factory()->create([
        'name' => 'Haircut',
        'default_duration' => 45,
        'default_price' => 40,
    ]);

    $service = app(CatalogImporter::class)->importService($catalog, $tenant);

    expect($service->tenant_id)->toBe($tenant->id)
        ->and($service->name)->toBe('Haircut')
        ->and((int) $service->duration)->toBe(45)
        ->and((float) $service->price)->toBe(40.0)
        ->and($service->catalog_service_id)->toBe($catalog->id)
        ->and($service->category->catalog_service_category_id)->toBe($catalog->catalog_service_category_id);
});

test('importing a catalog job type copies it onto the tenant', function () {
    $tenant = Tenant::factory()->create();
    $catalog = CatalogJobType::factory()->create([
        'name' => 'Stylist',
        'description' => 'Cuts and styles hair',
    ]);

    $jobType = app(CatalogImporter::class)->importJobType($catalog, $tenant);

    expect($jobType->tenant_id)->toBe($tenant->id)
        ->and($jobType->name)->toBe('Stylist')
        ->and($jobType->description)->toBe('Cuts and styles hair')
        ->and($jobType->catalog_job_type_id)->toBe($catalog->id)
        ->and($jobType->isFromCatalog())->toBeTrue();
});

test('tenants only see their own branches not other salons', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $own = Branch::factory()->create(['name' => 'Downtown branch', 'tenant_id' => $tenantA->id]);
    Branch::factory()->create(['name' => 'Other salon branch', 'tenant_id' => $tenantB->id]);

    app(TenantContext::class)->set($tenantA);

    $ids = Branch::query()->pluck('id')->all();

    expect($ids)->toContain($own->id)
        ->and($ids)->not->toContain(
            Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenantB->id)->value('id')
        );
});

test('branches store translatable name and address', function () {
    $tenant = Tenant::factory()->create();

    $branch = Branch::factory()->create([
        'tenant_id' => $tenant->id,
        'name' => ['en' => 'Downtown', 'ar' => 'وسط البلد'],
        'address' => ['en' => '1 Main Street, Cairo', 'ar' => '١ شارع رئيسي، القاهرة'],
    ]);

    $fresh = $branch->fresh();

    expect($fresh->getTranslatableAttributes())->toBe(['name', 'address'])
        ->and($fresh->getTranslation('name', 'en'))->toBe('Downtown')
        ->and($fresh->getTranslation('name', 'ar'))->toBe('وسط البلد')
        ->and($fresh->getTranslation('address', 'en'))->toBe('1 Main Street, Cairo')
        ->and($fresh->name)->toBe('وسط البلد')
        ->and($fresh->address)->toBe('١ شارع رئيسي، القاهرة');
});

test('branch edit page loads another branch while one is selected in context', function () {
    $tenant = Tenant::factory()->create();
    $selected = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $other = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->superAdmin()->create();

    $this->actingAs($user);
    app(BranchSelection::class)->set($selected);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);

    $this->get('/'.$tenant->slug.'/branches/'.$other->id.'/edit')
        ->assertOk();
});

test('tenants only see their own job type copies not other salons', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $own = JobType::factory()->create(['name' => 'Senior stylist', 'tenant_id' => $tenantA->id]);
    JobType::factory()->create(['name' => 'Other salon role', 'tenant_id' => $tenantB->id]);

    app(TenantContext::class)->set($tenantA);

    $ids = JobType::query()->pluck('id')->all();

    expect($ids)->toContain($own->id)
        ->and($ids)->not->toContain(
            JobType::query()->withoutGlobalScopes()->where('tenant_id', $tenantB->id)->value('id')
        );
});

test('an employee can be attached to a tenant with a job type and services', function () {
    $tenant = Tenant::factory()->create();
    $jobType = JobType::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create();

    $user->tenants()->attach($tenant->id, ['job_type_id' => $jobType->id]);

    expect($user->belongsToTenant($tenant))->toBeTrue()
        ->and($user->tenants()->whereKey($tenant->id)->first()?->pivot?->job_type_id)->toBe($jobType->id);
});
