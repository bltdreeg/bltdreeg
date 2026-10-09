<?php

use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
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
    $bloomBranches = Branch::query()->withoutGlobalScopes()->where('tenant_id', $bloom->id)->count();
    $petalBranches = Branch::query()->withoutGlobalScopes()->where('tenant_id', $petal->id)->count();

    expect($superAdmin)->not->toBeNull()
        ->and($superAdmin->is_super_admin)->toBeTrue()
        ->and($bloom)->not->toBeNull()
        ->and($petal)->not->toBeNull()
        ->and($owner)->not->toBeNull()
        ->and($owner->belongsToTenant($bloom))->toBeTrue()
        ->and($bloomBranches)->toBeGreaterThan(1)
        // Services are branch-owned, so each tenant holds the catalog once per branch.
        ->and(Service::query()->withoutGlobalScopes()->where('tenant_id', $bloom->id)->count())
        ->toBe(CatalogService::query()->count() * $bloomBranches)
        ->and(Service::query()->withoutGlobalScopes()->where('tenant_id', $petal->id)->count())
        ->toBe(CatalogService::query()->count() * $petalBranches)
        // Every branch holds the full catalog, not just the first.
        ->and(
            Service::query()->withoutGlobalScopes()
                ->where('tenant_id', $bloom->id)
                ->distinct()
                ->count('branch_id')
        )->toBe($bloomBranches);
});
