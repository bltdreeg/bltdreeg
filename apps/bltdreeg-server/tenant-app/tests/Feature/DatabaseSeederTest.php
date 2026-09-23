<?php

use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('database seeder creates demo tenants owners and imported services', function () {
    $this->seed();

    $bloom = Tenant::query()->where('slug', 'bloom')->first();
    $petal = Tenant::query()->where('slug', 'petal')->first();
    $superAdmin = User::query()->where('email', 'super@admin.dev')->first();
    $owner = User::query()->where('email', 'owner@bloom.dev')->first();

    expect($superAdmin)->not->toBeNull()
        ->and($superAdmin->is_super_admin)->toBeTrue()
        ->and($bloom)->not->toBeNull()
        ->and($petal)->not->toBeNull()
        ->and($owner)->not->toBeNull()
        ->and($owner->belongsToTenant($bloom))->toBeTrue()
        ->and(Service::query()->withoutGlobalScopes()->where('tenant_id', $bloom->id)->count())
        ->toBe(CatalogService::query()->count())
        ->and(Service::query()->withoutGlobalScopes()->where('tenant_id', $petal->id)->count())
        ->toBe(CatalogService::query()->count());
});
