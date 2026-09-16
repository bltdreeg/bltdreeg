<?php

use App\Modules\V1\Roles\Models\Role;
use App\Modules\V1\Roles\Services\RoleService;
use App\Support\CatalogImporter;
use Bltdreeg\Core\Models\CatalogJobType;
use Bltdreeg\Core\Models\CatalogService;
use Bltdreeg\Core\Models\JobType;
use Bltdreeg\Core\Models\RoleTemplate;
use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Bltdreeg\Core\Support\TenantContext;
use Bltdreeg\Core\Support\TenantPermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

test('creating a tenant copies predefined role templates', function () {
    RoleTemplate::factory()->create([
        'name' => 'Owner',
        'permissions' => TenantPermissions::names(),
    ]);

    $tenant = Tenant::factory()->create();

    app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());

    $role = Role::query()->where('tenant_id', $tenant->id)->where('name', 'Owner')->first();

    expect($role)->not->toBeNull()
        ->and($role->is_system)->toBeTrue();
});

test('a tenant can create a custom role', function () {
    $tenant = Tenant::factory()->create();

    app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());

    $role = Role::query()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Colorist',
        'guard_name' => 'web',
        'is_system' => false,
    ]);

    expect($role->is_system)->toBeFalse()
        ->and(Role::query()->where('tenant_id', $tenant->id)->where('name', 'Colorist')->exists())->toBeTrue();
});

test('duplicating a role copies permissions and numbers the name', function () {
    $tenant = Tenant::factory()->create();

    app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());

    $role = Role::query()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Colorist',
        'guard_name' => 'web',
        'is_system' => false,
    ]);
    $role->syncPermissions(['employees.index', 'roles.view']);

    $copy = app(RoleService::class)->duplicate($role, $tenant->id);

    expect($copy->name)->toBe('Colorist 2')
        ->and($copy->is_system)->toBeFalse()
        ->and($copy->permissions->pluck('name')->all())->toEqualCanonicalizing(['employees.index', 'roles.view']);
});

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
