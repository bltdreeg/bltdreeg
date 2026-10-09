<?php

use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Catalog\Support\CatalogImporter;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the same catalog service imports into each branch separately', function () {
    $tenant = Tenant::factory()->create();
    $one = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $two = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $catalog = CatalogService::factory()->create();

    $importer = app(CatalogImporter::class);
    $first = $importer->importService($catalog, $tenant, $one);
    $second = $importer->importService($catalog, $tenant, $two);

    expect($first->id)->not->toBe($second->id)
        ->and($first->branch_id)->toBe($one->id)
        ->and($second->branch_id)->toBe($two->id);
});

test('importing the same catalog service twice into one branch is idempotent', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $catalog = CatalogService::factory()->create();

    $importer = app(CatalogImporter::class);
    $first = $importer->importService($catalog, $tenant, $branch);
    $second = $importer->importService($catalog, $tenant, $branch);

    expect($second->id)->toBe($first->id)
        ->and(Service::query()->withoutGlobalScopes()->where('branch_id', $branch->id)->count())->toBe(1);
});

test('importing the catalog without a branch fills every branch of the tenant', function () {
    $tenant = Tenant::factory()->create();
    $branches = Branch::factory()->count(3)->create(['tenant_id' => $tenant->id]);
    CatalogService::factory()->count(2)->create(['is_active' => true]);

    app(CatalogImporter::class)->importCatalog($tenant);

    foreach ($branches as $branch) {
        expect(Service::query()->withoutGlobalScopes()->where('branch_id', $branch->id)->count())
            ->toBe(2);
    }
});
