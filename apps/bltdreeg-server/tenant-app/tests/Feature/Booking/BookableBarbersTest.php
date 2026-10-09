<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Support\BookableBarbers;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Modules\Catalog\Support\Catalog;
use Bltdreeg\Core\Modules\Catalog\Support\CatalogImporter;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function employee(Tenant $tenant, Branch $branch, ?JobType $jobType, array $attributes = []): User
{
    $user = User::factory()->create(['branch_id' => $branch->id, ...$attributes]);

    $user->tenants()->attach($tenant, ['job_type_id' => $jobType?->getKey()]);

    return $user;
}

test('an employee whose job type is bookable is a barber', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $barberJob = JobType::factory()->create(['tenant_id' => $tenant->id, 'is_bookable' => true]);

    $barber = employee($tenant, $branch, $barberJob, ['name' => 'Karim']);

    expect(BookableBarbers::forBranch($branch)->pluck('id')->all())->toBe([$barber->id]);
});

test('an employee whose job type is not bookable is excluded', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $cashierJob = JobType::factory()->create(['tenant_id' => $tenant->id, 'is_bookable' => false]);

    employee($tenant, $branch, $cashierJob);

    expect(BookableBarbers::forBranch($branch))->toHaveCount(0);
});

test('an employee with no job type is excluded', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    employee($tenant, $branch, null);

    expect(BookableBarbers::forBranch($branch))->toHaveCount(0);
});

test('an inactive employee is excluded', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $barberJob = JobType::factory()->create(['tenant_id' => $tenant->id, 'is_bookable' => true]);

    employee($tenant, $branch, $barberJob, ['is_active' => false]);

    expect(BookableBarbers::forBranch($branch))->toHaveCount(0);
});

test('a barber of another branch is excluded', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $theirs = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $barberJob = JobType::factory()->create(['tenant_id' => $tenant->id, 'is_bookable' => true]);

    employee($tenant, $theirs, $barberJob);

    expect(BookableBarbers::forBranch($mine))->toHaveCount(0);
});

test('a branch carries booking defaults', function () {
    $branch = Branch::factory()->create()->fresh();

    expect($branch->booking_days_ahead)->toBe(14)
        ->and($branch->booking_min_notice_minutes)->toBe(60)
        ->and($branch->booking_cancel_cutoff_minutes)->toBe(120)
        ->and($branch->booking_slot_step_minutes)->toBe(15)
        ->and($branch->booking_gap_minutes)->toBe(0);
});

test('the platform catalog flags the hair-cutting job types as bookable', function () {
    Catalog::seed();

    $bookable = CatalogJobType::query()->where('is_bookable', true)->pluck('name')->sort()->values()->all();

    expect($bookable)->toBe(['Barber', 'Hair stylist']);
});

test('an imported job type carries the bookable flag from the catalog', function () {
    $tenant = Tenant::factory()->create();
    $catalogBarber = CatalogJobType::factory()->create(['name' => 'Barber', 'is_bookable' => true]);
    $catalogDesk = CatalogJobType::factory()->create(['name' => 'Receptionist', 'is_bookable' => false]);

    $importer = app(CatalogImporter::class);

    expect($importer->importJobType($catalogBarber, $tenant)->is_bookable)->toBeTrue()
        ->and($importer->importJobType($catalogDesk, $tenant)->is_bookable)->toBeFalse();
});

/**
 * The production path: TenantSeeder runs when a salon's onboarding is approved and
 * seeds the example barber عاطف. The DatabaseSeeder's demo data creates branches and
 * owners but no employees, so it is not the seeder that produces barbers.
 */
test('approving a salon leaves it with a bookable barber at its branch', function () {
    Catalog::seed();

    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    app(TenantSeeder::class)->seed($tenant);

    $barbers = BookableBarbers::forBranch($branch);

    expect($barbers)->not->toBeEmpty()
        ->and($barbers->pluck('name')->all())->toContain('عاطف');
});
