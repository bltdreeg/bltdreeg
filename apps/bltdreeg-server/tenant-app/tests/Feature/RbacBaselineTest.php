<?php

declare(strict_types=1);

use App\Modules\V1\Hr\Filament\Resources\Attendance\EmployeeAttendanceResource;
use App\Modules\V1\Services\Filament\Resources\Services\ServiceResource;
use Bltdreeg\Core\Modules\Auth\Models\Permission;
use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Auth\Policies\RolePolicy;
use Bltdreeg\Core\Modules\Tenancy\Support\DemoData;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantProvisioner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;

uses(RefreshDatabase::class);

function ownerRoleName(): string
{
    return config('filament-shield.super_admin.name', 'owner');
}

function makeTenantOwner(Tenant $tenant): User
{
    return app(TenantProvisioner::class)->createTenantOwner(
        $tenant,
        'Owner '.$tenant->slug,
        'owner-'.$tenant->slug.'@test.dev',
        'password',
        '1'.str_pad((string) $tenant->id, 9, '0', STR_PAD_LEFT),
    );
}

test('owner of tenant A cannot read tenant B roles', function () {
    $tenantA = Tenant::factory()->create(['slug' => 'salon-a']);
    $tenantB = Tenant::factory()->create(['slug' => 'salon-b']);

    $ownerA = makeTenantOwner($tenantA);
    makeTenantOwner($tenantB);

    app(TenantContext::class)->set($tenantA);

    expect(Role::query()->pluck('tenant_id')->unique()->all())->toBe([$tenantA->id])
        ->and(Role::query()->where('tenant_id', $tenantB->id)->exists())->toBeFalse()
        ->and(Role::forTenant($tenantB)->count())->toBeGreaterThan(0)
        ->and($ownerA->hasRole(ownerRoleName()))->toBeTrue();
});

test('owner cannot edit an is_system role', function () {
    $tenant = Tenant::factory()->create();
    $owner = makeTenantOwner($tenant);

    app(TenantContext::class)->set($tenant);

    $systemRole = Role::query()
        ->where('name', ownerRoleName())
        ->firstOrFail();

    expect($systemRole->is_system)->toBeTrue();

    $policy = Gate::getPolicyFor(Role::class) ?? new RolePolicy;

    expect($policy->update($owner, $systemRole))->toBeFalse()
        ->and($policy->delete($owner, $systemRole))->toBeFalse();
});

test('a user with only ViewAny:Service cannot reach Attendance', function () {
    $tenant = Tenant::factory()->create();
    app(TenantProvisioner::class)->ensurePermissions();

    $user = User::factory()->create();
    $user->tenants()->attach($tenant->id);

    $permission = Permission::query()->firstOrCreate(
        ['name' => 'ViewAny:Service', 'guard_name' => 'web'],
    );

    $role = Role::withoutGlobalScopes()->firstOrCreate(
        [
            'tenant_id' => $tenant->id,
            'name' => 'service_viewer',
            'guard_name' => 'web',
        ],
        ['is_system' => false],
    );
    $role->syncPermissions([$permission]);
    $user->assignRole($role);

    $this->actingAs($user);

    expect($user->can('ViewAny:Service'))->toBeTrue()
        ->and($user->can('ViewAny:EmployeeAttendance'))->toBeFalse()
        ->and(ServiceResource::canViewAny())->toBeTrue()
        ->and(EmployeeAttendanceResource::canViewAny())->toBeFalse();
});

test('seeding twice is idempotent', function () {
    DemoData::seed();
    $tenantCount = Tenant::query()->count();
    $userCount = User::query()->count();
    $roleCount = Role::withoutGlobalScopes()->count();
    $permissionCount = Permission::query()->count();

    DemoData::seed();

    expect(Tenant::query()->count())->toBe($tenantCount)
        ->and(User::query()->count())->toBe($userCount)
        ->and(Role::withoutGlobalScopes()->count())->toBe($roleCount)
        ->and(Permission::query()->count())->toBe($permissionCount);
});
