<?php

use App\Models\Role;
use App\Models\Shop;
use App\Models\User;
use BezhanSalleh\FilamentShield\Resources\Roles\RoleResource;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

test('rendering an authenticated tenant page does not break global search permission checks', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $shop = Shop::factory()->create();

    $this->actingAs($superAdmin)
        ->get('/admin/'.$shop->getKey())
        ->assertOk();
});

test('the shield role resource resolves global search as a boolean within a tenant context', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $shop = Shop::factory()->create();

    Permission::firstOrCreate(['name' => 'ViewAny:Role', 'guard_name' => 'web']);

    $superAdminRole = Role::firstOrCreate([
        'shop_id' => $shop->getKey(),
        'name' => config('filament-shield.super_admin.name', 'super_admin'),
        'guard_name' => 'web',
    ]);
    $superAdminRole->givePermissionTo('ViewAny:Role');

    auth()->login($superAdmin);
    app(PermissionRegistrar::class)->setPermissionsTeamId($shop->getKey());
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    Filament::setTenant($shop);
    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();
    RoleResource::registerTenancyModelGlobalScope(Filament::getCurrentPanel());
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $result = RoleResource::canGloballySearch();

    expect($result)->toBeBool();
});
