<?php

use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Filament\Panel;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a super admin can access every tenant', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $tenant = Tenant::factory()->create();

    expect($superAdmin->canAccessTenant($tenant))->toBeTrue();
});

test('a regular user can only access tenants they belong to', function () {
    $user = User::factory()->create();
    $assignedTenant = Tenant::factory()->create();
    $otherTenant = Tenant::factory()->create();

    $user->tenants()->attach($assignedTenant);

    expect($user->canAccessTenant($assignedTenant))->toBeTrue()
        ->and($user->canAccessTenant($otherTenant))->toBeFalse();
});

test('a super admin sees every tenant', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $tenants = Tenant::factory()->count(3)->create();

    $result = $superAdmin->getTenants(app(Panel::class));

    expect($result->modelKeys())->toEqualCanonicalizing($tenants->modelKeys());
});

test('a regular user only sees their assigned tenants', function () {
    $user = User::factory()->create();
    $assignedTenant = Tenant::factory()->create();
    Tenant::factory()->count(2)->create();

    $user->tenants()->attach($assignedTenant);

    $result = $user->getTenants(app(Panel::class));

    expect($result->modelKeys())->toEqualCanonicalizing([$assignedTenant->id]);
});

test('inactive users cannot access the panel', function () {
    $inactiveUser = User::factory()->create(['is_active' => false]);

    expect($inactiveUser->canAccessPanel(app(Panel::class)))->toBeFalse();
});

test('visiting / with a tenant redirects into that tenant', function () {
    $user = User::factory()->create();
    $tenant = Tenant::factory()->create();
    $user->tenants()->attach($tenant);

    $this->actingAs($user)
        ->get('/')
        ->assertRedirect('/'.$tenant->slug);
});

test('visiting / while unauthenticated redirects to the login page', function () {
    $this->get('/')->assertRedirect('/login');
});

test('the services list page renders for a super admin inside a tenant', function () {
    $user = User::factory()->superAdmin()->create();
    $tenant = Tenant::factory()->create();

    $this->actingAs($user)
        ->get('/'.$tenant->slug.'/services')
        ->assertOk();
});
