<?php

use App\Modules\V1\Tenants\Filament\Resources\Tenants\Pages\CreateTenant;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\Pages\EditTenant;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\RelationManagers\ServicesRelationManager;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\TenantResource;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Filament\Facades\Filament;
use Filament\Panel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('a super admin can access the landlord panel', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    expect($superAdmin->canAccessPanel(app(Panel::class)->id('admin')))->toBeTrue();
});

test('a regular user cannot access the landlord panel', function () {
    $user = User::factory()->create();

    expect($user->canAccessPanel(app(Panel::class)->id('admin')))->toBeFalse();
});

test('the tenants list page renders for a super admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    Tenant::factory()->create();

    $this->actingAs($superAdmin)
        ->get('/tenants')
        ->assertOk();
});

test('the tenants resource is only visible to super admins', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $regularUser = User::factory()->create();

    auth()->login($superAdmin);
    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();
    expect(TenantResource::canViewAny())->toBeTrue();

    auth()->login($regularUser);
    expect(TenantResource::canViewAny())->toBeFalse();
});

test('creating a tenant does not assign a tenant owner role to platform super admins', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $tenant = Tenant::factory()->create();

    expect($superAdmin->fresh()->hasRole(config('filament-shield.super_admin.name')))->toBeFalse()
        ->and($superAdmin->roles()->count())->toBe(0);
});

test('creating a tenant also creates its salon owner with name email and password', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin);

    Livewire::test(CreateTenant::class)
        ->fillForm([
            'name' => 'Mrsawy Salon',
            'slug' => 'mrsawy',
            'email' => 'salon@mrsawy.test',
            'phone' => '01000000001',
            'address' => 'Cairo',
            'currency' => CurrencyEnum::EGP->value,
            'is_active' => true,
            'owner_name' => 'Mona Owner',
            'owner_email' => 'owner@mrsawy.test',
            'owner_password' => 'secret-password',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $tenant = Tenant::query()->where('slug', 'mrsawy')->first();
    $owner = User::query()->where('email', 'owner@mrsawy.test')->first();

    expect($tenant)->not->toBeNull()
        ->and($owner)->not->toBeNull()
        ->and($owner->name)->toBe('Mona Owner')
        ->and($owner->is_super_admin)->toBeFalse()
        ->and($owner->canAccessPanel(app(Panel::class)->id('admin')))->toBeFalse()
        ->and($owner->belongsToTenant($tenant))->toBeTrue()
        ->and(Hash::check('secret-password', $owner->password))->toBeTrue()
        ->and($owner->fresh()->hasRole(config('filament-shield.super_admin.name')))->toBeTrue();
});

test('visiting / while unauthenticated redirects to the login page', function () {
    $this->get('/')->assertRedirect('/login');
});

test('the catalog categories list page renders for a super admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->get('/catalog-categories')
        ->assertOk();
});

test('central can query salon services across tenants', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $categoryA = ServiceCategory::query()->create([
        'tenant_id' => $tenantA->id,
        'name' => 'Hair',
        'is_active' => true,
    ]);
    $categoryB = ServiceCategory::query()->create([
        'tenant_id' => $tenantB->id,
        'name' => 'Nails',
        'is_active' => true,
    ]);

    $serviceA = Service::query()->create([
        'tenant_id' => $tenantA->id,
        'category_id' => $categoryA->id,
        'name' => 'Unique Cut Alpha',
        'duration' => 30,
        'price' => 20,
        'is_active' => true,
    ]);
    Service::query()->create([
        'tenant_id' => $tenantB->id,
        'category_id' => $categoryB->id,
        'name' => 'Unique Manicure Bravo',
        'duration' => 40,
        'price' => 25,
        'is_active' => true,
    ]);

    expect(Service::query()->count())->toBe(2)
        ->and($tenantA->services()->pluck('name')->all())->toBe(['Unique Cut Alpha']);

    $this->actingAs(User::factory()->superAdmin()->create())
        ->get('/tenants/'.$tenantA->id.'/edit')
        ->assertOk();

    Livewire::test(ServicesRelationManager::class, [
        'ownerRecord' => $tenantA,
        'pageClass' => EditTenant::class,
    ])
        ->assertSuccessful()
        ->assertCanSeeTableRecords([$serviceA]);
});
