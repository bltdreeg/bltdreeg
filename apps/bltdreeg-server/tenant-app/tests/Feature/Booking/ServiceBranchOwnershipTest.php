<?php

use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a service belongs to a branch', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $service = Service::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
    ]);

    expect($service->branch_id)->toBe($branch->id)
        ->and($service->branch->is($branch))->toBeTrue();
});

test('the factory puts the service in a branch of its own tenant', function () {
    $service = Service::factory()->create();

    expect($service->branch->tenant_id)->toBe($service->tenant_id);
});

test('services are scoped to the branch in context', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $theirs = Branch::factory()->create(['tenant_id' => $tenant->id]);

    Service::factory()->create(['tenant_id' => $tenant->id, 'branch_id' => $mine->id]);
    Service::factory()->create(['tenant_id' => $tenant->id, 'branch_id' => $theirs->id]);

    app(BranchContext::class)->set($mine);

    expect(Service::query()->count())->toBe(1);

    app(BranchContext::class)->flush();

    expect(Service::query()->count())->toBe(2);
});
