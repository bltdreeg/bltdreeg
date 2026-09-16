<?php

use App\Modules\V1\Users\Filament\Resources\Users\Pages\CreateUser;
use App\Modules\V1\Users\Filament\Resources\Users\Pages\EditUser;
use App\Modules\V1\Users\Filament\Resources\Users\UserResource;
use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Bltdreeg\Core\Support\TenantProvisioner;
use Filament\Facades\Filament;
use Filament\Panel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

test('a user with central access can open the landlord panel', function () {
    $user = User::factory()->superAdmin()->create();

    expect($user->canAccessPanel(app(Panel::class)->id('admin')))->toBeTrue();
});

test('a user without central access cannot open the landlord panel', function () {
    $user = User::factory()->create(['is_super_admin' => false]);

    expect($user->canAccessPanel(app(Panel::class)->id('admin')))->toBeFalse();
});

test('the users list page renders for a super admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->get('/users')
        ->assertOk();
});

test('the users resource is only visible to super admins', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $regularUser = User::factory()->create();

    auth()->login($superAdmin);
    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();
    expect(UserResource::canViewAny())->toBeTrue();

    auth()->login($regularUser);
    expect(UserResource::canViewAny())->toBeFalse();
});

test('a super admin can create a user, grant central access, and assign tenants', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $tenant = Tenant::factory()->create(['name' => 'Salon One']);

    $this->actingAs($superAdmin);

    Livewire::test(CreateUser::class)
        ->fillForm([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '5550100',
            'password' => 'password',
            'is_active' => true,
            'is_super_admin' => true,
            'tenants' => [$tenant->getKey()],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $user = User::query()->where('email', 'jane@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->is_super_admin)->toBeTrue()
        ->and($user->is_active)->toBeTrue()
        ->and($user->canAccessPanel(app(Panel::class)->id('admin')))->toBeTrue()
        ->and($user->belongsToTenant($tenant))->toBeTrue();
});

test('a super admin can update tenant membership and revoke central access', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $tenantA = Tenant::factory()->create(['name' => 'Salon A']);
    $tenantB = Tenant::factory()->create(['name' => 'Salon B']);
    $user = User::factory()->create([
        'is_super_admin' => true,
        'phone' => '5550200',
    ]);
    $user->tenants()->attach($tenantA->getKey());

    $this->actingAs($superAdmin);

    Livewire::test(EditUser::class, ['record' => $user->getKey()])
        ->fillForm([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'is_active' => true,
            'is_super_admin' => false,
            'tenants' => [$tenantB->getKey()],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $user->refresh();

    expect($user->is_super_admin)->toBeFalse()
        ->and($user->canAccessPanel(app(Panel::class)->id('admin')))->toBeFalse()
        ->and($user->belongsToTenant($tenantA))->toBeFalse()
        ->and($user->belongsToTenant($tenantB))->toBeTrue();
});

test('a super admin cannot delete themselves', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin);

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();

    expect(UserResource::canDelete($superAdmin))->toBeFalse();
});

test('granting central access assigns the tenant super admin role', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['is_super_admin' => false]);

    $user->forceFill(['is_super_admin' => true])->save();
    app(TenantProvisioner::class)->syncSuperAdminAccess($user);

    app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());

    expect($user->fresh()->hasRole(config('filament-shield.super_admin.name')))->toBeTrue();
});
