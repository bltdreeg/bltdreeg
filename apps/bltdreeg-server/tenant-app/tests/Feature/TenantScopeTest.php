<?php

use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('service queries are scoped to the current tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $categoryA = ServiceCategory::withoutGlobalScopes()->create([
        'tenant_id' => $tenantA->id,
        'name' => 'Hair',
        'is_active' => true,
    ]);

    $inA = Service::withoutGlobalScopes()->create([
        'tenant_id' => $tenantA->id,
        'category_id' => $categoryA->id,
        'name' => 'Cut',
        'duration' => 30,
        'price' => 20,
        'is_active' => true,
    ]);

    $categoryB = ServiceCategory::withoutGlobalScopes()->create([
        'tenant_id' => $tenantB->id,
        'name' => 'Nails',
        'is_active' => true,
    ]);

    Service::withoutGlobalScopes()->create([
        'tenant_id' => $tenantB->id,
        'category_id' => $categoryB->id,
        'name' => 'Manicure',
        'duration' => 40,
        'price' => 25,
        'is_active' => true,
    ]);

    app(TenantContext::class)->set($tenantA);

    expect(Service::query()->pluck('id')->all())->toBe([$inA->id]);
});
