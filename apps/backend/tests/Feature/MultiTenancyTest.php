<?php

use App\Filament\Resources\Shops\ShopResource;
use App\Models\Shop;
use App\Models\User;
use Filament\Facades\Filament;
use Filament\Panel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function bootFilamentPanel(User $user, Shop $shop): void
{
    auth()->login($user);

    Filament::setTenant($shop);
    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();
}

test('a super admin can access every shop', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $shop = Shop::factory()->create();

    expect($superAdmin->canAccessTenant($shop))->toBeTrue();
});

test('a regular user can only access shops they belong to', function () {
    $user = User::factory()->create();
    $assignedShop = Shop::factory()->create();
    $otherShop = Shop::factory()->create();

    $user->shops()->attach($assignedShop);

    expect($user->canAccessTenant($assignedShop))->toBeTrue()
        ->and($user->canAccessTenant($otherShop))->toBeFalse();
});

test('a super admin sees every shop as a tenant', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $shops = Shop::factory()->count(3)->create();

    $tenants = $superAdmin->getTenants(app(Panel::class));

    expect($tenants->modelKeys())->toEqualCanonicalizing($shops->modelKeys());
});

test('a regular user only sees their assigned shops as tenants', function () {
    $user = User::factory()->create();
    $assignedShop = Shop::factory()->create();
    Shop::factory()->count(2)->create();

    $user->shops()->attach($assignedShop);

    $tenants = $user->getTenants(app(Panel::class));

    expect($tenants->modelKeys())->toEqualCanonicalizing([$assignedShop->id]);
});

test('the shops resource is only visible to super admins', function () {
    $shop = Shop::factory()->create();

    $superAdmin = User::factory()->superAdmin()->create();
    $regularUser = User::factory()->create();

    bootFilamentPanel($superAdmin, $shop);
    expect(ShopResource::canViewAny())->toBeTrue();

    bootFilamentPanel($regularUser, $shop);
    expect(ShopResource::canViewAny())->toBeFalse();
});

test('inactive users cannot access the panel', function () {
    $inactiveUser = User::factory()->create(['is_active' => false]);

    expect($inactiveUser->canAccessPanel(app(Panel::class)))->toBeFalse();
});

test('creating a shop grants the super admin role to every super admin user', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $shop = Shop::factory()->create();

    app(PermissionRegistrar::class)->setPermissionsTeamId($shop->getKey());

    expect($superAdmin->hasRole(config('filament-shield.super_admin.name')))->toBeTrue();
});

test('creating a shop does not grant the super admin role to regular users', function () {
    $regularUser = User::factory()->create();
    $shop = Shop::factory()->create();

    app(PermissionRegistrar::class)->setPermissionsTeamId($shop->getKey());

    expect($regularUser->hasRole(config('filament-shield.super_admin.name')))->toBeFalse();
});

test('visiting /admin with no shops redirects the super admin to the tenant registration page', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->get('/admin')
        ->assertRedirect('/admin/new');
});

test('the tenant registration page renders for a super admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->get('/admin/new')
        ->assertOk();
});

test('visiting /admin while unauthenticated redirects to the login page', function () {
    $this->get('/admin')->assertRedirect('/admin/login');
});

test('visiting /admin with a shop redirects into the first available shop', function () {
    $user = User::factory()->create();
    $shop = Shop::factory()->create();
    $user->shops()->attach($shop);

    $this->actingAs($user)
        ->get('/admin')
        ->assertRedirect('/admin/'.$shop->getKey());
});
