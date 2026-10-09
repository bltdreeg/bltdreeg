<?php

use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

/**
 * Rolls back to just before 2026_10_09_000001 by name, so the step count stays right
 * as later tasks add migrations. Returns the number of migrations reverted.
 */
function rollbackToBeforeBranchIdOnServices(object $test): void
{
    $target = '2026_10_09_000001_add_branch_id_to_services_table';

    $steps = DB::table('migrations')
        ->where('migration', '>=', $target)
        ->count();

    expect($steps)->toBeGreaterThan(0);

    $test->artisan('migrate:rollback', ['--step' => $steps, '--no-interaction' => true])
        ->assertSuccessful();

    expect(DB::table('migrations')->where('migration', $target)->exists())->toBeFalse();
}

test('every branch of a tenant ends up with the full service list', function () {
    $tenant = Tenant::factory()->create();
    $branches = Branch::factory()->count(3)->create(['tenant_id' => $tenant->id]);

    foreach ($branches as $branch) {
        Service::factory()->count(4)->create([
            'tenant_id' => $tenant->id,
            'branch_id' => $branch->id,
        ]);
    }

    foreach ($branches as $branch) {
        expect(Service::query()->withoutGlobalScopes()->where('branch_id', $branch->id)->count())
            ->toBe(4);
    }

    expect(Service::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())
        ->toBe(12);
});

test('the migration fans legacy tenant-level services out into every branch', function () {
    // Build the pre-migration world: branches exist, services have no branch_id.
    $tenant = Tenant::factory()->create();
    $branches = Branch::factory()->count(3)->create(['tenant_id' => $tenant->id]);
    $category = DB::table('service_categories')->insertGetId([
        'tenant_id' => $tenant->getKey(),
        'name' => json_encode(['ar' => 'شعر']),
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    rollbackToBeforeBranchIdOnServices($this);

    foreach (['قص', 'حلاقة'] as $name) {
        DB::table('services')->insert([
            'tenant_id' => $tenant->getKey(),
            'category_id' => $category,
            'name' => json_encode(['ar' => $name]),
            'duration' => 30,
            'price' => 50,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    expect(DB::table('services')->count())->toBe(2);

    $this->artisan('migrate', ['--no-interaction' => true])->assertSuccessful();

    // Two services now exist in each of the three branches.
    expect(DB::table('services')->count())->toBe(6);

    foreach ($branches as $branch) {
        expect(DB::table('services')->where('branch_id', $branch->getKey())->count())->toBe(2);
    }

    expect(DB::table('services')->whereNull('branch_id')->count())->toBe(0);
});

test('the migration drops legacy services whose tenant has no branch at all', function () {
    $tenant = Tenant::factory()->create();
    $category = DB::table('service_categories')->insertGetId([
        'tenant_id' => $tenant->getKey(),
        'name' => json_encode(['ar' => 'شعر']),
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    rollbackToBeforeBranchIdOnServices($this);

    DB::table('services')->insert([
        'tenant_id' => $tenant->getKey(),
        'category_id' => $category,
        'name' => json_encode(['ar' => 'قص']),
        'duration' => 30,
        'price' => 50,
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->artisan('migrate', ['--no-interaction' => true])->assertSuccessful();

    // A branch-owned service cannot exist without a branch, so the row is removed
    // rather than left violating the new NOT NULL column.
    expect(DB::table('services')->count())->toBe(0);
});
