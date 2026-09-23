<?php

use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('database seeder creates landlord catalog tenants and owners', function () {
    $this->seed();

    expect(User::query()->where('email', 'super@admin.dev')->where('is_super_admin', true)->exists())->toBeTrue()
        ->and(Tenant::query()->where('slug', 'bloom')->exists())->toBeTrue()
        ->and(Tenant::query()->where('slug', 'petal')->exists())->toBeTrue()
        ->and(User::query()->where('email', 'owner@bloom.dev')->exists())->toBeTrue()
        ->and(User::query()->where('email', 'owner@petal.dev')->exists())->toBeTrue()
        ->and(CatalogService::query()->count())->toBeGreaterThan(0);
});
