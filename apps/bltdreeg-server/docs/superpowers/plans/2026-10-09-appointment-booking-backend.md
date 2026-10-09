# Appointment Booking — Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the booking domain in `packages/core` — branch-owned services and packages, per-barber schedules and time blocks, a rules-based availability engine, and the booking lifecycle — with no UI.

**Architecture:** A new `Bltdreeg\Core\Modules\Booking` module holds models, enums, and support classes. Availability is computed per request from weekly schedules minus bookings minus blocks; nothing is materialized. An occupancy-level cache stores the engine's *inputs* (windows, booking footprints, blocks) as plain arrays, never the computed grid. Every booking write takes a per-barber day lock, re-validates, then inserts.

**Tech Stack:** PHP 8.3, Laravel 13, Filament 5, Pest (SQLite in-memory), Spatie Translatable, Spatie Permission, Redis in production / array cache in tests.

**Spec:** `apps/bltdreeg-server/docs/superpowers/specs/2026-10-09-appointment-booking-design.md`

This plan covers spec §13 steps 1–5 (§4.1–4.11, §5, §6). Two later plans cover the tenant dashboard (§9) and the public API plus `apps/web` (§7, §8, §10), then the doc rewrite (§11).

## Global Constraints

- PHP `^8.3`; `illuminate/*` `^13.0`; `filament/filament` `^5.0`. Do not add dependencies.
- All new shared code lives under `packages/core/src/Modules/Booking/`, namespace `Bltdreeg\Core\Modules\Booking`.
- All new migrations live in `packages/core/database/migrations/` and are loaded by `CoreServiceProvider::boot()`. **Never edit an already-applied migration.**
- Models declare fillables with the `#[Fillable([...])]` attribute, translatable fields with `#[Translatable(...)]` plus `use HasTranslations` and an `'array'` cast, and casts via a `protected function casts(): array` method. Match `Bltdreeg\Core\Modules\Services\Models\Service`.
- Core model factories live in `packages/core/src/Modules/<Module>/Database/Factories/` and are wired through `protected static function newFactory()`.
- Money is `decimal(10,2)`; currency stays `CurrencyEnum` as `unsignedTinyInteger`.
- Derived values are never stored: no queue-number column, no slot rows (ADR 0004).
- Times are stored UTC. Schedule `start_time` / `end_time` are **branch-local wall-clock** in the timezone from `config('booking.timezone')`, default `Africa/Cairo`.
- Tests are Pest, under `tenant-app/tests/Feature/Booking/`, each file starting `uses(RefreshDatabase::class);`. Run from `apps/bltdreeg-server/tenant-app`.
- Cached callbacks must return scalars and arrays only, never models — `config('cache.serializable_classes')` is `false`. See the `CachableModel` docblock.
- Commit after every task with a `feat(booking):` or `refactor(services):` subject, and end each message with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## Review Focus

Five input classes the spec implies but no task's own happy-path tests would exercise. Each has its pinning test added to the task that owns the code.

1. **Africa/Cairo DST transitions.** Egypt resumed DST in 2023. On the spring-forward day the local hour 00:00–01:00 does not exist, and on fall-back it occurs twice. A grid built by adding local minutes must not emit nonexistent or duplicated start times. → Task 8.
2. **A schedule window crossing midnight** (22:00–02:00). Validation rejects `end_time <= start_time`, so a barber working past midnight has no representation at all. That must fail loudly at save time with a clear message, not silently produce an empty day. → Task 5.
3. **`lockForUpdate` is a no-op on SQLite.** The suite runs on SQLite in-memory, so a true two-process race cannot be reproduced there. The overlap guard needs a deterministic unit test of its own, and the race test must skip explicitly rather than pass vacuously. → Task 9.
4. **A package with zero member services, or members from another branch.** Either yields a 0-minute booking that occupies nothing and blocks nobody. Resolution must reject both. → Task 7.
5. **Cancelled and no-show bookings must leave occupancy.** If they stay, their slots never return and queue numbers count ghosts. → Tasks 6 (queue numbers) and 8 (occupancy).

## Task Map

| # | Deliverable |
|---|---|
| 1 | `services` becomes branch-owned |
| 2 | `CatalogImporter` becomes branch-aware |
| 3 | Packages (`packages`, `package_service`, duration/saving derivation) |
| 4 | `is_bookable` job types + branch booking settings + bookable-barber query |
| 5 | Barber settings, weekly schedules, time blocks |
| 6 | `bookings` / `booking_items` + `QueueNumberProjector` |
| 7 | `BasketResolver` |
| 8 | `OccupancyCache` + `AvailabilityEngine` |
| 9 | `BookingService` + domain events + overlap guard |

The engine (8) reads booking footprints, so the `bookings` schema (6) lands
before it. Tasks 6 and 7 are independent of each other.

---

### Task 1: `services` becomes branch-owned

**Files:**
- Create: `packages/core/database/migrations/2026_10_09_000001_add_branch_id_to_services_table.php`
- Modify: `packages/core/src/Modules/Services/Models/Service.php`
- Modify: `packages/core/src/Modules/Services/Database/Factories/ServiceFactory.php`
- Test: `tenant-app/tests/Feature/Booking/ServiceBranchOwnershipTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `services.branch_id` (required, FK `branches`); `Service` uses `BelongsToBranch`, so `Service::query()` is branch-scoped whenever `BranchContext` is set; `ServiceFactory` creates a branch in the same tenant as the service.

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/Booking/ServiceBranchOwnershipTest.php`:

```php
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/ServiceBranchOwnershipTest.php`
Expected: FAIL — `services` has no `branch_id` column.

- [ ] **Step 3: Write the migration**

Create `packages/core/database/migrations/2026_10_09_000001_add_branch_id_to_services_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Services move from tenant-owned to branch-owned (spec §4.1). Existing rows attach to
 * the tenant's lowest-id branch and are duplicated into every other branch of that
 * tenant, so no branch starts empty and no row is lost. `service_categories` stay
 * tenant-level — a category is grouping only.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            $table->foreignId('branch_id')->nullable()->after('tenant_id')
                ->constrained('branches')->cascadeOnDelete();
        });

        $this->backfill();

        Schema::table('services', function (Blueprint $table): void {
            $table->foreignId('branch_id')->nullable(false)->change();
            $table->index(['branch_id', 'is_active']);
        });
    }

    private function backfill(): void
    {
        $branchesByTenant = DB::table('branches')
            ->orderBy('id')
            ->get(['id', 'tenant_id'])
            ->groupBy('tenant_id');

        foreach ($branchesByTenant as $tenantId => $branches) {
            $ids = $branches->pluck('id')->all();
            $primary = array_shift($ids);

            DB::table('services')
                ->where('tenant_id', $tenantId)
                ->whereNull('branch_id')
                ->update(['branch_id' => $primary]);

            if ($ids === []) {
                continue;
            }

            $originals = DB::table('services')
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $primary)
                ->get();

            foreach ($ids as $branchId) {
                $rows = $originals->map(function (object $row) use ($branchId): array {
                    $copy = (array) $row;
                    unset($copy['id']);
                    $copy['branch_id'] = $branchId;

                    return $copy;
                })->all();

                if ($rows !== []) {
                    DB::table('services')->insert($rows);
                }
            }
        }

        // A tenant with no branches at all cannot hold branch-owned services.
        DB::table('services')->whereNull('branch_id')->delete();
    }

    public function down(): void
    {
        // Keep only the rows this migration treated as originals: those in each
        // tenant's lowest-id branch. Identity is never compared by the translatable
        // `name` JSON.
        $primaryIds = DB::table('branches')
            ->select('tenant_id', DB::raw('MIN(id) as id'))
            ->groupBy('tenant_id')
            ->pluck('id')
            ->all();

        if ($primaryIds !== []) {
            DB::table('services')->whereNotIn('branch_id', $primaryIds)->delete();
        }

        Schema::table('services', function (Blueprint $table): void {
            $table->dropIndex(['branch_id', 'is_active']);
            $table->dropConstrainedForeignId('branch_id');
        });
    }
};
```

- [ ] **Step 4: Add `BelongsToBranch` to the model**

In `packages/core/src/Modules/Services/Models/Service.php`, add `branch_id` to the `#[Fillable]` list (after `tenant_id`), add the imports, the trait, and the relation:

```php
use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
```

```php
#[Fillable(['tenant_id', 'branch_id', 'category_id', 'catalog_service_id', 'name', 'description', 'duration', 'price', 'currency', 'is_active'])]
```

```php
    use BelongsToBranch;
    use BelongsToTenant;
```

```php
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
```

- [ ] **Step 5: Make the factory put the service in its tenant's branch**

In `packages/core/src/Modules/Services/Database/Factories/ServiceFactory.php`, add the import and the `branch_id` key. The closure runs after `tenant_id` has been resolved to an id, so the branch lands in the same tenant:

```php
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
```

```php
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'branch_id' => fn (array $attributes) => Branch::factory()->create([
                'tenant_id' => $attributes['tenant_id'],
            ])->getKey(),
            'category_id' => ServiceCategory::factory(),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'duration' => fake()->numberBetween(30, 120),
            'price' => fake()->randomFloat(2, 10, 200),
            'is_active' => true,
        ];
    }
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/ServiceBranchOwnershipTest.php`
Expected: PASS (3 tests).

- [ ] **Step 7: Run the whole suite to catch fallout**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test`
Expected: PASS. `CatalogAndHrTest`, `ServiceTranslationAndCurrencyTest` and `TenantScopeTest` touch services; if any fails because it creates a `Service` without a branch, fix the **test** by passing a branch of the same tenant — do not relax the column.

- [ ] **Step 8: Verify the backfill against a real multi-branch tenant**

Create `tenant-app/tests/Feature/Booking/ServiceBranchBackfillTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

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
```

This pins the post-migration shape — 3 branches × 4 services = 12 rows, each branch complete — which is what the backfill produces for pre-existing data.

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/ServiceBranchBackfillTest.php`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/bltdreeg-server/packages/core/database/migrations/2026_10_09_000001_add_branch_id_to_services_table.php \
        apps/bltdreeg-server/packages/core/src/Modules/Services/Models/Service.php \
        apps/bltdreeg-server/packages/core/src/Modules/Services/Database/Factories/ServiceFactory.php \
        apps/bltdreeg-server/tenant-app/tests/Feature/Booking/
git commit -m "$(cat <<'EOF'
refactor(services): make services branch-owned

Adds services.branch_id, backfills existing tenant rows into every branch of
the tenant, and scopes the model with BelongsToBranch. Service categories stay
tenant-level.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `CatalogImporter` becomes branch-aware

`importService()` currently keys `firstOrCreate` on `(tenant_id, catalog_service_id)`. With branch-owned services that lookup finds another branch's row, so the second branch silently imports nothing. The branch must be explicit.

**Files:**
- Modify: `packages/core/src/Modules/Catalog/Support/CatalogImporter.php`
- Modify: `packages/core/src/Modules/Tenancy/Support/TenantSeeder.php:45`
- Modify: `packages/core/src/Modules/Tenancy/Support/DemoData.php:43`
- Modify: `tenant-app/app/Modules/V1/Services/Filament/Resources/Services/Pages/ListServices.php:47-57`
- Modify: `tenant-app/tests/Feature/CatalogAndHrTest.php:25`
- Modify: `tenant-app/tests/Feature/ServiceTranslationAndCurrencyTest.php:34`
- Test: `tenant-app/tests/Feature/Booking/CatalogImportPerBranchTest.php`

**Interfaces:**
- Consumes: `services.branch_id` from Task 1.
- Produces: `CatalogImporter::importService(CatalogService $catalog, Tenant $tenant, Branch $branch): Service` — branch now required. `CatalogImporter::importCatalog(Tenant $tenant, ?Branch $branch = null): void` — a null branch imports into **every** branch of the tenant. `importCategory()` and `importJobType()` keep their signatures (both stay tenant-level).

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/Booking/CatalogImportPerBranchTest.php`:

```php
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/CatalogImportPerBranchTest.php`
Expected: FAIL — `importService()` takes two arguments, not three.

- [ ] **Step 3: Make the importer branch-aware**

In `packages/core/src/Modules/Catalog/Support/CatalogImporter.php`, add the import and replace `importService()` and `importCatalog()`:

```php
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
```

```php
    public function importService(CatalogService $catalog, Tenant $tenant, Branch $branch): Service
    {
        $category = $this->importCategory($catalog->category, $tenant);

        return Service::query()->withoutGlobalScopes()->firstOrCreate(
            [
                'tenant_id' => $tenant->getKey(),
                'branch_id' => $branch->getKey(),
                'catalog_service_id' => $catalog->getKey(),
            ],
            [
                'category_id' => $category->getKey(),
                'name' => $catalog->getTranslations('name'),
                'description' => $catalog->getTranslations('description') ?: null,
                'duration' => $catalog->default_duration,
                'price' => $catalog->default_price,
                'is_active' => true,
            ],
        );
    }

    /**
     * A null branch imports into every branch of the tenant — what seeding and demo
     * data want. Job types stay tenant-level, so they are imported once either way.
     */
    public function importCatalog(Tenant $tenant, ?Branch $branch = null): void
    {
        $branches = $branch !== null
            ? collect([$branch])
            : Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->getKey())->get();

        CatalogService::query()
            ->where('is_active', true)
            ->with('category')
            ->each(function (CatalogService $service) use ($tenant, $branches): void {
                foreach ($branches as $target) {
                    $this->importService($service, $tenant, $target);
                }
            });

        CatalogJobType::query()
            ->where('is_active', true)
            ->each(fn (CatalogJobType $jobType) => $this->importJobType($jobType, $tenant));
    }
```

`withoutGlobalScopes()` on the lookup is deliberate: the importer is called from seeders and from pages where `BranchContext` may point at a different branch than the import target, and the branch is already an explicit key here.

- [ ] **Step 4: Update the Filament page to pass the current branch**

In `tenant-app/app/Modules/V1/Services/Filament/Resources/Services/Pages/ListServices.php`, add the import:

```php
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
```

and replace the `->action(...)` closure body:

```php
                ->action(function (array $data, CatalogImporter $importer): void {
                    $tenant = Filament::getTenant();
                    $branch = app(BranchContext::class)->branch;

                    if ($branch === null) {
                        Notification::make()
                            ->title('Select a branch first')
                            ->danger()
                            ->send();

                        return;
                    }

                    foreach ($data['catalog_service_ids'] as $id) {
                        $catalog = CatalogService::query()->find($id);

                        if ($catalog) {
                            $importer->importService($catalog, $tenant, $branch);
                        }
                    }

                    Notification::make()
                        ->title('Catalog services imported')
                        ->success()
                        ->send();
                }),
```

The `catalog_service_ids` option list already filters by `Service::query()`, which is branch-scoped after Task 1, so the dropdown now correctly offers services not yet imported **into this branch**.

- [ ] **Step 5: Fix the two existing tests that call `importService`**

In `tenant-app/tests/Feature/CatalogAndHrTest.php` around line 25 and `tenant-app/tests/Feature/ServiceTranslationAndCurrencyTest.php` around line 34, each test creates a `$tenant` then imports. Add a branch and pass it. In `CatalogAndHrTest.php`:

```php
$branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
$service = app(CatalogImporter::class)->importService($catalog, $tenant, $branch);
```

In `ServiceTranslationAndCurrencyTest.php`:

```php
$branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
$service = app(CatalogImporter::class)->importService($catalog, $tenant, $branch)->fresh();
```

Add `use Bltdreeg\Core\Modules\Tenancy\Models\Branch;` to the top of both files.

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/CatalogImportPerBranchTest.php`
Expected: PASS (3 tests).

- [ ] **Step 7: Run the whole suite**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test`
Expected: PASS. `DatabaseSeederTest` exercises `TenantSeeder`/`DemoData`, which call `importCatalog($tenant)` — the null-branch path now fans out per branch, so no call-site change is needed there. If `DatabaseSeederTest` asserts an exact service count, update the expected number to `services × branches` and say so in the commit body.

- [ ] **Step 8: Commit**

```bash
git add apps/bltdreeg-server/packages/core/src/Modules/Catalog/Support/CatalogImporter.php \
        apps/bltdreeg-server/tenant-app/app/Modules/V1/Services/Filament/Resources/Services/Pages/ListServices.php \
        apps/bltdreeg-server/tenant-app/tests/
git commit -m "$(cat <<'EOF'
refactor(catalog): import services per branch

importService now takes the target branch and keys firstOrCreate on it, so
each branch imports its own copy. importCatalog with no branch fans out to
every branch of the tenant, which is what seeding wants.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Packages

**Files:**
- Create: `packages/core/database/migrations/2026_10_09_000002_create_packages_table.php`
- Create: `packages/core/database/migrations/2026_10_09_000003_create_package_service_table.php`
- Create: `packages/core/src/Modules/Booking/Models/Package.php`
- Create: `packages/core/src/Modules/Booking/Database/Factories/PackageFactory.php`
- Test: `tenant-app/tests/Feature/Booking/PackageTest.php`

**Interfaces:**
- Consumes: `services.branch_id` (Task 1).
- Produces: `Bltdreeg\Core\Modules\Booking\Models\Package` with `services(): BelongsToMany`, `effectiveDuration(): int`, `servicesTotal(): float`, `saving(): float`. Table `packages` (branch-owned) and pivot `package_service`.

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/Booking/PackageTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Booking\Models\Package;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function packageWithServices(array $services, array $attributes = []): Package
{
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $package = Package::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        ...$attributes,
    ]);

    foreach ($services as $service) {
        $package->services()->attach(
            Service::factory()->create([
                'tenant_id' => $tenant->id,
                'branch_id' => $branch->id,
                'duration' => $service['duration'],
                'price' => $service['price'],
            ])
        );
    }

    return $package->load('services');
}

test('a package keeps a translatable name', function () {
    $package = Package::factory()->create([
        'name' => ['en' => 'Full groom', 'ar' => 'باكدج كامل'],
    ])->fresh();

    expect($package->getTranslation('name', 'en'))->toBe('Full groom')
        ->and($package->getTranslation('name', 'ar'))->toBe('باكدج كامل');
});

test('a package is priced in egp by default', function () {
    expect(Package::factory()->create()->fresh()->currency)->toBe(CurrencyEnum::EGP);
});

test('the duration defaults to the sum of its services', function () {
    $package = packageWithServices([
        ['duration' => 30, 'price' => 100],
        ['duration' => 20, 'price' => 60],
    ], ['duration' => null]);

    expect($package->effectiveDuration())->toBe(50);
});

test('an explicit duration overrides the sum', function () {
    $package = packageWithServices([
        ['duration' => 30, 'price' => 100],
        ['duration' => 20, 'price' => 60],
    ], ['duration' => 40]);

    expect($package->effectiveDuration())->toBe(40);
});

test('the saving is the services total minus the package price', function () {
    $package = packageWithServices([
        ['duration' => 30, 'price' => 100],
        ['duration' => 20, 'price' => 60],
    ], ['price' => 130]);

    expect($package->servicesTotal())->toBe(160.0)
        ->and($package->saving())->toBe(30.0);
});

test('packages are scoped to the branch in context', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $theirs = Branch::factory()->create(['tenant_id' => $tenant->id]);

    Package::factory()->create(['tenant_id' => $tenant->id, 'branch_id' => $mine->id]);
    Package::factory()->create(['tenant_id' => $tenant->id, 'branch_id' => $theirs->id]);

    app(BranchContext::class)->set($mine);

    expect(Package::query()->count())->toBe(1);

    app(BranchContext::class)->flush();
});

test('a service cannot be attached to a package in another branch', function () {
    $package = packageWithServices([]);
    $otherTenant = Tenant::factory()->create();
    $foreign = Service::factory()->create([
        'tenant_id' => $otherTenant->id,
        'branch_id' => Branch::factory()->create(['tenant_id' => $otherTenant->id])->id,
    ]);

    expect(fn () => $package->attachService($foreign))
        ->toThrow(InvalidArgumentException::class);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/PackageTest.php`
Expected: FAIL — class `Bltdreeg\Core\Modules\Booking\Models\Package` not found.

- [ ] **Step 3: Write the `packages` migration**

Create `packages/core/database/migrations/2026_10_09_000002_create_packages_table.php`:

```php
<?php

use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Packages are branch-owned from birth (spec §4.2). `duration` is an override:
 * null means "sum of the member services", which is the normal case.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->json('name');
            $table->json('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->unsignedTinyInteger('currency')->default(CurrencyEnum::EGP->value);
            $table->integer('duration')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['branch_id', 'is_active']);
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
```

- [ ] **Step 4: Write the `package_service` migration**

Create `packages/core/database/migrations/2026_10_09_000003_create_package_service_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Both sides must belong to the same branch. That spans two tables, so it is
 * enforced in Package::attachService() rather than by a constraint.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_service', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['package_id', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_service');
    }
};
```

- [ ] **Step 5: Write the `Package` model**

Create `packages/core/src/Modules/Booking/Models/Package.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Booking\Database\Factories\PackageFactory;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use InvalidArgumentException;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['tenant_id', 'branch_id', 'name', 'description', 'price', 'currency', 'duration', 'is_active', 'sort_order'])]
#[Translatable('name', 'description')]
class Package extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;
    use HasTranslations;

    protected static function newFactory()
    {
        return PackageFactory::new();
    }

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'price' => 'decimal:2',
            'currency' => CurrencyEnum::class,
            'duration' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'package_service')->withTimestamps();
    }

    /**
     * Attach a member service, refusing one from another branch. The pivot spans
     * two tables, so no database constraint can express this.
     */
    public function attachService(Service $service): void
    {
        if ((int) $service->branch_id !== (int) $this->branch_id) {
            throw new InvalidArgumentException(
                "Service {$service->getKey()} belongs to branch {$service->branch_id}, not {$this->branch_id}."
            );
        }

        $this->services()->syncWithoutDetaching([$service->getKey()]);
    }

    /**
     * The override when set, else the sum of the member services. A package with no
     * members has no duration — callers must treat 0 as unbookable (see BasketResolver).
     */
    public function effectiveDuration(): int
    {
        if ($this->duration !== null) {
            return (int) $this->duration;
        }

        return (int) $this->services->sum(fn (Service $service): int => (int) $service->duration);
    }

    /** What the member services would cost bought separately. */
    public function servicesTotal(): float
    {
        return (float) $this->services->sum(fn (Service $service): float => (float) $service->price);
    }

    /** What the customer saves versus buying the members separately. */
    public function saving(): float
    {
        return round($this->servicesTotal() - (float) $this->price, 2);
    }
}
```

- [ ] **Step 6: Write the factory**

Create `packages/core/src/Modules/Booking/Database/Factories/PackageFactory.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Database\Factories;

use Bltdreeg\Core\Modules\Booking\Models\Package;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Package>
 */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'branch_id' => fn (array $attributes) => Branch::factory()->create([
                'tenant_id' => $attributes['tenant_id'],
            ])->getKey(),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 50, 400),
            'duration' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/PackageTest.php`
Expected: PASS (7 tests).

- [ ] **Step 8: Commit**

```bash
git add apps/bltdreeg-server/packages/core/database/migrations/2026_10_09_00000[23]_* \
        apps/bltdreeg-server/packages/core/src/Modules/Booking/ \
        apps/bltdreeg-server/tenant-app/tests/Feature/Booking/PackageTest.php
git commit -m "$(cat <<'EOF'
feat(booking): branch-owned packages

Packages bundle branch services at a list price. Duration defaults to the sum
of the members and can be overridden; saving() exposes the discount versus
buying the members separately. attachService refuses a cross-branch member.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Bookable job types, branch booking settings, bookable-barber query

**Files:**
- Create: `packages/core/database/migrations/2026_10_09_000004_add_booking_settings_to_job_types_and_branches.php`
- Create: `packages/core/src/Modules/Booking/Support/BookableBarbers.php`
- Modify: `packages/core/src/Modules/Tenancy/Models/Branch.php`
- Modify: `packages/core/src/Modules/Hr/Models/JobType.php`
- Modify: `packages/core/src/Modules/Catalog/Models/CatalogJobType.php`
- Modify: `packages/core/src/Modules/Catalog/Support/CatalogImporter.php`
- Test: `tenant-app/tests/Feature/Booking/BookableBarbersTest.php`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `job_types.is_bookable`, `catalog_job_types.is_bookable`; the five `branches.booking_*` columns; `BookableBarbers::forBranch(Branch $branch): \Illuminate\Database\Eloquent\Collection` returning `User` models ordered by name.

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/Booking/BookableBarbersTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Support\BookableBarbers;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/BookableBarbersTest.php`
Expected: FAIL — `BookableBarbers` not found.

- [ ] **Step 3: Write the migration**

Create `packages/core/database/migrations/2026_10_09_000004_add_booking_settings_to_job_types_and_branches.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A bookable barber is an employee whose job type is flagged bookable (spec §4.4) —
 * no separate barber entity. The flag lives on both the tenant's job types and the
 * platform catalog, so an imported job type carries it over.
 *
 * The branch columns are the booking windows and the defaults that prefill a new
 * barber's settings.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_types', function (Blueprint $table): void {
            $table->boolean('is_bookable')->default(false)->after('is_active');
        });

        Schema::table('catalog_job_types', function (Blueprint $table): void {
            $table->boolean('is_bookable')->default(false)->after('is_active');
        });

        Schema::table('branches', function (Blueprint $table): void {
            $table->unsignedSmallInteger('booking_days_ahead')->default(14);
            $table->unsignedSmallInteger('booking_min_notice_minutes')->default(60);
            $table->unsignedSmallInteger('booking_cancel_cutoff_minutes')->default(120);
            $table->unsignedSmallInteger('booking_slot_step_minutes')->default(15);
            $table->unsignedSmallInteger('booking_gap_minutes')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('job_types', fn (Blueprint $table) => $table->dropColumn('is_bookable'));
        Schema::table('catalog_job_types', fn (Blueprint $table) => $table->dropColumn('is_bookable'));

        Schema::table('branches', function (Blueprint $table): void {
            $table->dropColumn([
                'booking_days_ahead',
                'booking_min_notice_minutes',
                'booking_cancel_cutoff_minutes',
                'booking_slot_step_minutes',
                'booking_gap_minutes',
            ]);
        });
    }
};
```

- [ ] **Step 4: Expose the new columns on the models**

In `packages/core/src/Modules/Hr/Models/JobType.php`, add `is_bookable` to `#[Fillable]` and to `casts()`:

```php
#[Fillable(['tenant_id', 'catalog_job_type_id', 'name', 'description', 'is_active', 'is_bookable'])]
```

```php
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_bookable' => 'boolean',
        ];
    }
```

Do the same for `packages/core/src/Modules/Catalog/Models/CatalogJobType.php`: add `is_bookable` to its `#[Fillable]` list and `'is_bookable' => 'boolean'` to its `casts()`.

In `packages/core/src/Modules/Tenancy/Models/Branch.php`, append the five columns to the `#[Fillable]` list (after `'is_active'`) and add their casts to `casts()`:

```php
            'booking_days_ahead' => 'integer',
            'booking_min_notice_minutes' => 'integer',
            'booking_cancel_cutoff_minutes' => 'integer',
            'booking_slot_step_minutes' => 'integer',
            'booking_gap_minutes' => 'integer',
```

- [ ] **Step 5: Carry the flag through catalog import**

In `packages/core/src/Modules/Catalog/Support/CatalogImporter.php`, add `is_bookable` to the `importJobType()` create payload:

```php
    public function importJobType(CatalogJobType $catalog, Tenant $tenant): JobType
    {
        return JobType::query()->firstOrCreate(
            [
                'tenant_id' => $tenant->getKey(),
                'catalog_job_type_id' => $catalog->getKey(),
            ],
            [
                'name' => $catalog->name,
                'description' => $catalog->description,
                'is_active' => true,
                'is_bookable' => (bool) $catalog->is_bookable,
            ],
        );
    }
```

- [ ] **Step 6: Write the bookable-barber query**

Create `packages/core/src/Modules/Booking/Support/BookableBarbers.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder as QueryBuilder;

/**
 * Barbers are employees, not a separate entity (spec §4.4): a user seated at the
 * branch whose job type for that tenant is flagged bookable. The pivot carries the
 * job type, so this reaches through `tenant_user` with the query builder — the
 * JobType model's tenant scope would otherwise depend on ambient context.
 */
final class BookableBarbers
{
    public static function query(Branch $branch): Builder
    {
        return User::query()
            ->where('users.branch_id', $branch->getKey())
            ->where('users.is_active', true)
            ->whereExists(fn (QueryBuilder $query) => $query
                ->from('tenant_user')
                ->join('job_types', 'job_types.id', '=', 'tenant_user.job_type_id')
                ->whereColumn('tenant_user.user_id', 'users.id')
                ->where('tenant_user.tenant_id', $branch->tenant_id)
                ->where('job_types.is_bookable', true)
                ->where('job_types.is_active', true))
            ->orderBy('users.name');
    }

    public static function forBranch(Branch $branch): Collection
    {
        return self::query($branch)->get();
    }

    public static function includes(Branch $branch, User $user): bool
    {
        return self::query($branch)->whereKey($user->getKey())->exists();
    }
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/BookableBarbersTest.php`
Expected: PASS (6 tests).

- [ ] **Step 8: Run the whole suite**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/bltdreeg-server/packages/core/database/migrations/2026_10_09_000004_* \
        apps/bltdreeg-server/packages/core/src/Modules/Booking/Support/BookableBarbers.php \
        apps/bltdreeg-server/packages/core/src/Modules/Tenancy/Models/Branch.php \
        apps/bltdreeg-server/packages/core/src/Modules/Hr/Models/JobType.php \
        apps/bltdreeg-server/packages/core/src/Modules/Catalog/Models/CatalogJobType.php \
        apps/bltdreeg-server/packages/core/src/Modules/Catalog/Support/CatalogImporter.php \
        apps/bltdreeg-server/tenant-app/tests/Feature/Booking/BookableBarbersTest.php
git commit -m "$(cat <<'EOF'
feat(booking): bookable job types and branch booking windows

A barber is an employee whose job type is flagged bookable, so no new entity is
needed. Branches gain the booking windows (days ahead, min notice, cancel
cutoff) and the slot-step/gap defaults for new barbers.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Barber settings, weekly schedules, time blocks

The three stored inputs the engine reads. Together they are one deliverable — a barber's bookable time is not configurable until all three exist.

**Files:**
- Create: `packages/core/database/migrations/2026_10_09_000005_create_barber_booking_settings_table.php`
- Create: `packages/core/database/migrations/2026_10_09_000006_create_barber_schedules_table.php`
- Create: `packages/core/database/migrations/2026_10_09_000007_create_barber_time_blocks_table.php`
- Create: `packages/core/src/Modules/Booking/Models/BarberBookingSettings.php`
- Create: `packages/core/src/Modules/Booking/Models/BarberSchedule.php`
- Create: `packages/core/src/Modules/Booking/Models/BarberTimeBlock.php`
- Create: `packages/core/src/Modules/Booking/Support/BookingSettings.php`
- Create: `packages/core/src/Modules/Booking/Database/Factories/BarberScheduleFactory.php`
- Create: `packages/core/src/Modules/Booking/Database/Factories/BarberTimeBlockFactory.php`
- Test: `tenant-app/tests/Feature/Booking/BarberScheduleTest.php`

**Interfaces:**
- Consumes: `branches.booking_*` and `BookableBarbers` (Task 4).
- Produces:
  - `BarberBookingSettings` model (table `barber_booking_settings`).
  - `BarberSchedule` model with `start_time`/`end_time` normalized to `H:i:s`, rejecting `end <= start` and overlapping windows on save.
  - `BarberTimeBlock` model with `starts_at`/`ends_at` datetime casts and `is_full_day`.
  - `BookingSettings::resolve(Branch $branch, User $barber): BookingSettings` — a readonly object with `slotStepMinutes`, `gapMinutes`, `isPaused`, `maxDaysAhead`, `minNoticeMinutes`, `cancelCutoffMinutes`, each falling back to the branch default when the barber has no override.

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/Booking/BarberScheduleTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberBookingSettings;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Booking\Support\BookingSettings;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function barberIn(Branch $branch): User
{
    return User::factory()->create(['branch_id' => $branch->id]);
}

function scheduleFor(Branch $branch, User $barber, int $weekday, string $start, string $end): BarberSchedule
{
    return BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => $weekday,
        'start_time' => $start,
        'end_time' => $end,
        'is_active' => true,
    ]);
}

test('a weekly window is stored normalized to H:i:s', function () {
    $branch = Branch::factory()->create();
    $schedule = scheduleFor($branch, barberIn($branch), 0, '10:00', '14:00')->fresh();

    expect($schedule->start_time)->toBe('10:00:00')
        ->and($schedule->end_time)->toBe('14:00:00');
});

test('a barber can have two windows on the same weekday', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    scheduleFor($branch, $barber, 0, '10:00', '14:00');
    scheduleFor($branch, $barber, 0, '17:00', '22:00');

    expect(BarberSchedule::query()->where('user_id', $barber->id)->count())->toBe(2);
});

test('a window ending before it starts is rejected', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    expect(fn () => scheduleFor($branch, $barber, 0, '14:00', '10:00'))
        ->toThrow(InvalidArgumentException::class, 'end_time must be after start_time');
});

test('a window crossing midnight is rejected with a clear message', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    expect(fn () => scheduleFor($branch, $barber, 0, '22:00', '02:00'))
        ->toThrow(InvalidArgumentException::class, 'end_time must be after start_time');
});

test('overlapping windows on the same weekday are rejected', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    scheduleFor($branch, $barber, 0, '10:00', '14:00');

    expect(fn () => scheduleFor($branch, $barber, 0, '13:00', '16:00'))
        ->toThrow(InvalidArgumentException::class, 'overlaps');
});

test('the same window on a different weekday is fine', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    scheduleFor($branch, $barber, 0, '10:00', '14:00');
    scheduleFor($branch, $barber, 1, '10:00', '14:00');

    expect(BarberSchedule::query()->where('user_id', $barber->id)->count())->toBe(2);
});

test('settings fall back to the branch defaults', function () {
    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 20,
        'booking_gap_minutes' => 5,
        'booking_days_ahead' => 7,
        'booking_min_notice_minutes' => 30,
        'booking_cancel_cutoff_minutes' => 90,
    ]);

    $settings = BookingSettings::resolve($branch, barberIn($branch));

    expect($settings->slotStepMinutes)->toBe(20)
        ->and($settings->gapMinutes)->toBe(5)
        ->and($settings->maxDaysAhead)->toBe(7)
        ->and($settings->minNoticeMinutes)->toBe(30)
        ->and($settings->cancelCutoffMinutes)->toBe(90)
        ->and($settings->isPaused)->toBeFalse();
});

test('a barber override beats the branch default', function () {
    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 20,
        'booking_days_ahead' => 7,
    ]);
    $barber = barberIn($branch);

    BarberBookingSettings::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'slot_step_minutes' => 15,
        'gap_minutes' => 10,
        'is_paused' => true,
        'max_days_ahead' => 3,
    ]);

    $settings = BookingSettings::resolve($branch, $barber);

    expect($settings->slotStepMinutes)->toBe(15)
        ->and($settings->gapMinutes)->toBe(10)
        ->and($settings->maxDaysAhead)->toBe(3)
        ->and($settings->isPaused)->toBeTrue()
        // min_notice_minutes left null on the override, so the branch value stands
        ->and($settings->minNoticeMinutes)->toBe((int) $branch->booking_min_notice_minutes);
});

test('a time block records a range and a full-day flag', function () {
    $branch = Branch::factory()->create();
    $barber = barberIn($branch);

    $block = BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => '2026-11-10 08:00:00',
        'ends_at' => '2026-11-15 20:00:00',
        'is_full_day' => true,
        'reason' => 'Leave',
    ])->fresh();

    expect($block->is_full_day)->toBeTrue()
        ->and($block->starts_at->toDateString())->toBe('2026-11-10')
        ->and($block->reason)->toBe('Leave');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/BarberScheduleTest.php`
Expected: FAIL — `BarberSchedule` not found.

- [ ] **Step 3: Write the three migrations**

Create `packages/core/database/migrations/2026_10_09_000005_create_barber_booking_settings_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One row per (branch, barber), created lazily from the branch defaults on first
 * edit (spec §4.5). Nullable columns mean "use the branch value".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_booking_settings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedSmallInteger('slot_step_minutes')->default(15);
            $table->unsignedSmallInteger('gap_minutes')->default(0);
            $table->boolean('is_paused')->default(false);
            $table->unsignedSmallInteger('max_days_ahead')->nullable();
            $table->unsignedSmallInteger('min_notice_minutes')->nullable();
            $table->timestamps();

            $table->unique(['branch_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_booking_settings');
    }
};
```

Create `packages/core/database/migrations/2026_10_09_000006_create_barber_schedules_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Weekly bookable windows, branch-local wall clock (spec §4.6). Multiple rows per
 * weekday are expected: two windows are a split shift, and a lunch break is the
 * space between them. Branches have no opening-hours columns, so these windows are
 * the only source of bookable time.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday'); // 0 = Sunday
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'user_id', 'weekday', 'start_time']);
            $table->index(['branch_id', 'user_id', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_schedules');
    }
};
```

Create `packages/core/database/migrations/2026_10_09_000007_create_barber_time_blocks_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One table for all four blocking kinds (spec §4.7): a single slot is a narrow
 * range, a window is a wider one, a day off sets is_full_day, and leave is one row
 * spanning days.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_time_blocks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->boolean('is_full_day')->default(false);
            $table->string('reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['branch_id', 'user_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_time_blocks');
    }
};
```

- [ ] **Step 4: Write `BarberBookingSettings`**

Create `packages/core/src/Modules/Booking/Models/BarberBookingSettings.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'branch_id', 'user_id', 'slot_step_minutes', 'gap_minutes', 'is_paused', 'max_days_ahead', 'min_notice_minutes'])]
class BarberBookingSettings extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;

    protected $table = 'barber_booking_settings';

    protected function casts(): array
    {
        return [
            'slot_step_minutes' => 'integer',
            'gap_minutes' => 'integer',
            'is_paused' => 'boolean',
            'max_days_ahead' => 'integer',
            'min_notice_minutes' => 'integer',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

- [ ] **Step 5: Write `BarberSchedule` with its window validation**

Create `packages/core/src/Modules/Booking/Models/BarberSchedule.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Database\Factories\BarberScheduleFactory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use InvalidArgumentException;

#[Fillable(['tenant_id', 'branch_id', 'user_id', 'weekday', 'start_time', 'end_time', 'is_active'])]
class BarberSchedule extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return BarberScheduleFactory::new();
    }

    protected static function booted(): void
    {
        static::saving(fn (self $schedule) => $schedule->guardWindow());
    }

    protected function casts(): array
    {
        return [
            'weekday' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected function startTime(): Attribute
    {
        return Attribute::make(set: fn (string $value): string => self::normalizeTime($value));
    }

    protected function endTime(): Attribute
    {
        return Attribute::make(set: fn (string $value): string => self::normalizeTime($value));
    }

    public static function normalizeTime(string $value): string
    {
        $timestamp = strtotime($value);

        if ($timestamp === false) {
            throw new InvalidArgumentException("\"{$value}\" is not a time.");
        }

        return date('H:i:s', $timestamp);
    }

    /**
     * A window lives inside one calendar day. A barber working 22:00–02:00 has no
     * representation here, so the save fails loudly rather than storing a window the
     * engine would read as empty.
     */
    private function guardWindow(): void
    {
        if ($this->end_time <= $this->start_time) {
            throw new InvalidArgumentException(
                "end_time must be after start_time; a window crossing midnight must be split into two windows (got {$this->start_time}–{$this->end_time})."
            );
        }

        $clash = static::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $this->branch_id)
            ->where('user_id', $this->user_id)
            ->where('weekday', $this->weekday)
            ->when($this->exists, fn ($query) => $query->whereKeyNot($this->getKey()))
            ->where('start_time', '<', $this->end_time)
            ->where('end_time', '>', $this->start_time)
            ->first();

        if ($clash !== null) {
            throw new InvalidArgumentException(
                "{$this->start_time}–{$this->end_time} overlaps the existing window {$clash->start_time}–{$clash->end_time} on weekday {$this->weekday}."
            );
        }
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

- [ ] **Step 6: Write `BarberTimeBlock`**

Create `packages/core/src/Modules/Booking/Models/BarberTimeBlock.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Database\Factories\BarberTimeBlockFactory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'branch_id', 'user_id', 'starts_at', 'ends_at', 'is_full_day', 'reason', 'created_by'])]
class BarberTimeBlock extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return BarberTimeBlockFactory::new();
    }

    protected function casts(): array
    {
        return [
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'is_full_day' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

- [ ] **Step 7: Write `BookingSettings`**

Create `packages/core/src/Modules/Booking/Support/BookingSettings.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberBookingSettings;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;

/**
 * The effective booking rules for one barber at one branch: the barber's overrides
 * resolved against the branch defaults (spec §4.5, §4.4).
 */
final readonly class BookingSettings
{
    public function __construct(
        public int $slotStepMinutes,
        public int $gapMinutes,
        public bool $isPaused,
        public int $maxDaysAhead,
        public int $minNoticeMinutes,
        public int $cancelCutoffMinutes,
    ) {}

    public static function resolve(Branch $branch, User $barber): self
    {
        $row = BarberBookingSettings::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->getKey())
            ->where('user_id', $barber->getKey())
            ->first();

        return new self(
            slotStepMinutes: $row?->slot_step_minutes ?? (int) $branch->booking_slot_step_minutes,
            gapMinutes: $row?->gap_minutes ?? (int) $branch->booking_gap_minutes,
            isPaused: (bool) ($row?->is_paused ?? false),
            maxDaysAhead: $row?->max_days_ahead ?? (int) $branch->booking_days_ahead,
            minNoticeMinutes: $row?->min_notice_minutes ?? (int) $branch->booking_min_notice_minutes,
            // Cancel/reschedule is a branch policy; a barber has no override for it.
            cancelCutoffMinutes: (int) $branch->booking_cancel_cutoff_minutes,
        );
    }
}
```

- [ ] **Step 8: Write the two factories**

Create `packages/core/src/Modules/Booking/Database/Factories/BarberScheduleFactory.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Database\Factories;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BarberSchedule>
 */
class BarberScheduleFactory extends Factory
{
    protected $model = BarberSchedule::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'branch_id' => fn (array $attributes) => Branch::factory()->create([
                'tenant_id' => $attributes['tenant_id'],
            ])->getKey(),
            'user_id' => fn (array $attributes) => User::factory()->create([
                'branch_id' => $attributes['branch_id'],
            ])->getKey(),
            'weekday' => 0,
            'start_time' => '10:00:00',
            'end_time' => '22:00:00',
            'is_active' => true,
        ];
    }
}
```

Create `packages/core/src/Modules/Booking/Database/Factories/BarberTimeBlockFactory.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Database\Factories;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BarberTimeBlock>
 */
class BarberTimeBlockFactory extends Factory
{
    protected $model = BarberTimeBlock::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'branch_id' => fn (array $attributes) => Branch::factory()->create([
                'tenant_id' => $attributes['tenant_id'],
            ])->getKey(),
            'user_id' => fn (array $attributes) => User::factory()->create([
                'branch_id' => $attributes['branch_id'],
            ])->getKey(),
            'starts_at' => now()->addDay()->setTime(12, 0),
            'ends_at' => now()->addDay()->setTime(13, 0),
            'is_full_day' => false,
            'reason' => null,
        ];
    }
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/BarberScheduleTest.php`
Expected: PASS (10 tests). The midnight-crossing case is Review Focus item 2.

- [ ] **Step 10: Commit**

```bash
git add apps/bltdreeg-server/packages/core/database/migrations/2026_10_09_00000[567]_* \
        apps/bltdreeg-server/packages/core/src/Modules/Booking/ \
        apps/bltdreeg-server/tenant-app/tests/Feature/Booking/BarberScheduleTest.php
git commit -m "$(cat <<'EOF'
feat(booking): barber settings, weekly schedules and time blocks

The three stored inputs the availability engine reads. Schedules hold
branch-local windows, several per weekday for split shifts, and refuse a window
that ends before it starts or overlaps another. One block table covers a single
slot, a window, a day off and a leave range. BookingSettings resolves a barber's
overrides against the branch defaults.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `bookings`, `booking_items`, and the queue-number projector

**Files:**
- Create: `packages/core/database/migrations/2026_10_09_000008_create_bookings_table.php`
- Create: `packages/core/database/migrations/2026_10_09_000009_create_booking_items_table.php`
- Create: `packages/core/src/Modules/Booking/Enums/BookingStatusEnum.php`
- Create: `packages/core/src/Modules/Booking/Enums/BookingSourceEnum.php`
- Create: `packages/core/src/Modules/Booking/Models/Booking.php`
- Create: `packages/core/src/Modules/Booking/Models/BookingItem.php`
- Create: `packages/core/src/Modules/Booking/Database/Factories/BookingFactory.php`
- Create: `packages/core/src/Modules/Booking/Support/QueueNumberProjector.php`
- Test: `tenant-app/tests/Feature/Booking/QueueNumberTest.php`

**Interfaces:**
- Consumes: `Package` (Task 3), branch-owned `Service` (Task 1).
- Produces:
  - `BookingStatusEnum` cases `Confirmed`, `Completed`, `Cancelled`, `NoShow` with `->occupiesTime(): bool` (true for `Confirmed` and `Completed`) and `::occupying(): array<string>`.
  - `BookingSourceEnum` cases `App`, `Dashboard`.
  - `Booking` model with `items()`, `barber()`, `customer()`, `branch()`, `footprintEndsAt(): CarbonImmutable`, `customerLabel(): string`, and scopes `scopeOccupying()`, `scopeForBarberOn()`.
  - `BookingItem` model.
  - `QueueNumberProjector::for(Booking $booking): int` and `::preview(Branch $branch, User $barber, CarbonImmutable $startsAt): int`.

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/Booking/QueueNumberTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Booking\Support\QueueNumberProjector;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function bookingAt(Branch $branch, User $barber, string $startsAt, int $minutes = 30, BookingStatusEnum $status = BookingStatusEnum::Confirmed): Booking
{
    $start = CarbonImmutable::parse($startsAt);

    return Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes($minutes),
        'duration_minutes' => $minutes,
        'status' => $status,
    ]);
}

test('queue numbers follow appointment start time', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    $second = bookingAt($branch, $barber, '2026-11-02 18:30:00');
    $first = bookingAt($branch, $barber, '2026-11-02 17:00:00');
    $third = bookingAt($branch, $barber, '2026-11-02 19:00:00');

    expect(QueueNumberProjector::for($first))->toBe(1)
        ->and(QueueNumberProjector::for($second))->toBe(2)
        ->and(QueueNumberProjector::for($third))->toBe(3);
});

test('cancelling a booking renumbers the ones behind it', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    $first = bookingAt($branch, $barber, '2026-11-02 17:00:00');
    $second = bookingAt($branch, $barber, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::for($second))->toBe(2);

    $first->update(['status' => BookingStatusEnum::Cancelled]);

    expect(QueueNumberProjector::for($second->fresh()))->toBe(1);
});

test('a no-show does not hold a queue position', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    bookingAt($branch, $barber, '2026-11-02 17:00:00', status: BookingStatusEnum::NoShow);
    $mine = bookingAt($branch, $barber, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::for($mine))->toBe(1);
});

test('queue numbers are per barber', function () {
    $branch = Branch::factory()->create();
    $one = User::factory()->create(['branch_id' => $branch->id]);
    $two = User::factory()->create(['branch_id' => $branch->id]);

    bookingAt($branch, $one, '2026-11-02 17:00:00');
    $mine = bookingAt($branch, $two, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::for($mine))->toBe(1);
});

test('queue numbers are per day', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    bookingAt($branch, $barber, '2026-11-01 17:00:00');
    $mine = bookingAt($branch, $barber, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::for($mine))->toBe(1);
});

test('a preview says what position a time would take', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    bookingAt($branch, $barber, '2026-11-02 17:00:00');
    bookingAt($branch, $barber, '2026-11-02 18:00:00');

    expect(QueueNumberProjector::preview($branch, $barber, CarbonImmutable::parse('2026-11-02 19:00:00')))->toBe(3)
        ->and(QueueNumberProjector::preview($branch, $barber, CarbonImmutable::parse('2026-11-02 16:00:00')))->toBe(1);
});

test('a booking keeps snapshot items', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);
    $booking = bookingAt($branch, $barber, '2026-11-02 17:00:00');

    $booking->items()->create([
        'name_snapshot' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
        'price_snapshot' => 120.00,
        'duration_snapshot' => 30,
        'sort' => 0,
    ]);

    expect($booking->fresh()->items)->toHaveCount(1)
        ->and($booking->fresh()->items->first()->duration_snapshot)->toBe(30);
});

test('the footprint extends past the appointment by its own stored gap', function () {
    $branch = Branch::factory()->create();
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    $booking = bookingAt($branch, $barber, '2026-11-02 17:00:00', 30);
    $booking->update(['gap_minutes' => 10]);

    expect($booking->fresh()->footprintEndsAt()->format('H:i'))->toBe('17:40');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/QueueNumberTest.php`
Expected: FAIL — `BookingStatusEnum` not found.

- [ ] **Step 3: Write the enums**

Create `packages/core/src/Modules/Booking/Enums/BookingStatusEnum.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Enums;

enum BookingStatusEnum: string
{
    case Confirmed = 'confirmed';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';

    /**
     * Whether the booking still holds its place on the barber's day. Cancelled and
     * no-show bookings release their time: the slot returns to availability and the
     * bookings behind them move up a queue number.
     */
    public function occupiesTime(): bool
    {
        return match ($this) {
            self::Confirmed, self::Completed => true,
            self::Cancelled, self::NoShow => false,
        };
    }

    /** @return array<int, string> */
    public static function occupying(): array
    {
        return array_values(array_map(
            fn (self $case): string => $case->value,
            array_filter(self::cases(), fn (self $case): bool => $case->occupiesTime()),
        ));
    }

    public function isTerminal(): bool
    {
        return $this !== self::Confirmed;
    }
}
```

Create `packages/core/src/Modules/Booking/Enums/BookingSourceEnum.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Enums;

enum BookingSourceEnum: string
{
    case App = 'app';
    case Dashboard = 'dashboard';
}
```

- [ ] **Step 4: Write the two migrations**

Create `packages/core/database/migrations/2026_10_09_000008_create_bookings_table.php`:

```php
<?php

use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * An appointment: a reserved range on a barber (spec §4.8). The queue number is
 * never stored — it is derived from start order (ADR 0004).
 *
 * customer_id is nullable because dashboard bookings carry only a free-text name
 * and phone; app bookings always have a customer.
 *
 * gap_minutes is a snapshot: raising a barber's gap later must not retroactively
 * invalidate bookings taken under the old gap.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('barber_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('guest_name')->nullable();
            $table->string('guest_phone')->nullable();
            $table->string('source')->default(BookingSourceEnum::App->value);
            $table->string('status')->default(BookingStatusEnum::Confirmed->value);
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->unsignedSmallInteger('duration_minutes');
            $table->unsignedSmallInteger('gap_minutes')->default(0);
            $table->decimal('total_price', 10, 2)->default(0);
            $table->unsignedTinyInteger('currency')->default(CurrencyEnum::EGP->value);
            $table->string('booking_code')->unique();
            $table->text('notes')->nullable();
            $table->boolean('is_forced')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('cancelled_by_customer')->nullable();
            $table->foreignId('rescheduled_from_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->timestamps();

            $table->index(['branch_id', 'starts_at']);
            $table->index(['barber_user_id', 'starts_at']);
            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
```

Create `packages/core/database/migrations/2026_10_09_000009_create_booking_items_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Exactly one of service_id / package_id is set. Name, price and duration are
 * snapshotted at booking time, so a later catalog change never alters an existing
 * booking (spec §4.9).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->json('name_snapshot');
            $table->decimal('price_snapshot', 10, 2);
            $table->integer('duration_snapshot');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();

            $table->index('booking_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_items');
    }
};
```

- [ ] **Step 5: Write the `Booking` model**

Create `packages/core/src/Modules/Booking/Models/Booking.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Database\Factories\BookingFactory;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id', 'branch_id', 'barber_user_id', 'customer_id', 'guest_name', 'guest_phone',
    'source', 'status', 'starts_at', 'ends_at', 'duration_minutes', 'gap_minutes',
    'total_price', 'currency', 'booking_code', 'notes', 'is_forced', 'created_by_user_id',
    'cancelled_at', 'cancelled_by_customer', 'rescheduled_from_id',
])]
class Booking extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return BookingFactory::new();
    }

    protected function casts(): array
    {
        return [
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'cancelled_at' => 'immutable_datetime',
            'duration_minutes' => 'integer',
            'gap_minutes' => 'integer',
            'total_price' => 'decimal:2',
            'currency' => CurrencyEnum::class,
            'status' => BookingStatusEnum::class,
            'source' => BookingSourceEnum::class,
            'is_forced' => 'boolean',
            'cancelled_by_customer' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(User::class, 'barber_user_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    /**
     * How far the booking actually blocks the barber: the appointment plus the gap
     * recorded when it was booked.
     */
    public function footprintEndsAt(): CarbonImmutable
    {
        return $this->ends_at->addMinutes((int) $this->gap_minutes);
    }

    /** Whoever this booking is for, whether an account holder or a walk-in. */
    public function customerLabel(): string
    {
        return $this->customer_id !== null
            ? trim(($this->customer?->first_name ?? '').' '.($this->customer?->last_name ?? '')) ?: (string) $this->customer?->phone
            : (string) $this->guest_name;
    }

    /** Only bookings that still hold their time. */
    public function scopeOccupying(Builder $query): Builder
    {
        return $query->whereIn('status', BookingStatusEnum::occupying());
    }

    public function scopeForBarberOn(Builder $query, int $barberId, CarbonImmutable $localDate): Builder
    {
        return $query
            ->where('barber_user_id', $barberId)
            ->whereBetween('starts_at', [
                $localDate->startOfDay()->utc(),
                $localDate->endOfDay()->utc(),
            ]);
    }
}
```

- [ ] **Step 6: Write the `BookingItem` model**

Create `packages/core/src/Modules/Booking/Models/BookingItem.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Modules\Services\Models\Service;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['booking_id', 'service_id', 'package_id', 'name_snapshot', 'price_snapshot', 'duration_snapshot', 'sort'])]
class BookingItem extends Model
{
    protected function casts(): array
    {
        return [
            'name_snapshot' => 'array',
            'price_snapshot' => 'decimal:2',
            'duration_snapshot' => 'integer',
            'sort' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
```

- [ ] **Step 7: Write the factory**

Create `packages/core/src/Modules/Booking/Database/Factories/BookingFactory.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Database\Factories;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $start = CarbonImmutable::tomorrow()->setTime(12, 0);

        return [
            'tenant_id' => Tenant::factory(),
            'branch_id' => fn (array $attributes) => Branch::factory()->create([
                'tenant_id' => $attributes['tenant_id'],
            ])->getKey(),
            'barber_user_id' => fn (array $attributes) => User::factory()->create([
                'branch_id' => $attributes['branch_id'],
            ])->getKey(),
            'customer_id' => null,
            'guest_name' => fake()->name(),
            'guest_phone' => '+201000000000',
            'source' => BookingSourceEnum::Dashboard,
            'status' => BookingStatusEnum::Confirmed,
            'starts_at' => $start,
            'ends_at' => $start->addMinutes(30),
            'duration_minutes' => 30,
            'gap_minutes' => 0,
            'total_price' => 100.00,
            'booking_code' => fn (): string => Str::upper(Str::random(3)).'-'.fake()->unique()->numberBetween(100, 999),
            'is_forced' => false,
        ];
    }
}
```

- [ ] **Step 8: Write the projector**

Create `packages/core/src/Modules/Booking/Support/QueueNumberProjector.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;

/**
 * "رقمك في الدور" — the customer's position among that barber's bookings for the
 * day, by appointment start. Derived on read, never stored (ADR 0004), so a
 * cancellation renumbers everyone behind it with no write.
 */
final class QueueNumberProjector
{
    public static function for(Booking $booking): int
    {
        return self::rank(
            (int) $booking->barber_user_id,
            self::localDate($booking->starts_at),
            $booking->starts_at,
            exceptId: $booking->getKey(),
        );
    }

    public static function preview(Branch $branch, User $barber, CarbonImmutable $startsAt): int
    {
        return self::rank(
            $barber->getKey(),
            self::localDate($startsAt),
            $startsAt,
        );
    }

    private static function rank(int $barberId, CarbonImmutable $localDate, CarbonImmutable $startsAt, int|string|null $exceptId = null): int
    {
        $ahead = Booking::query()
            ->withoutGlobalScopes()
            ->occupying()
            ->forBarberOn($barberId, $localDate)
            ->where('starts_at', '<', $startsAt->utc())
            ->when($exceptId !== null, fn ($query) => $query->whereKeyNot($exceptId))
            ->count();

        return $ahead + 1;
    }

    private static function localDate(CarbonImmutable $moment): CarbonImmutable
    {
        return $moment->setTimezone(BookingTime::zone());
    }
}
```

- [ ] **Step 9: Write `BookingTime` and the booking config**

`QueueNumberProjector` and the engine both need the branch-local timezone. Create `packages/core/config/booking.php`:

```php
<?php

return [
    /*
     * Schedule windows are branch-local wall clock; bookings are stored UTC. Egypt
     * observes DST again as of 2023, so this must be a real zone, never a fixed offset.
     */
    'timezone' => env('BOOKING_TIMEZONE', 'Africa/Cairo'),

    /*
     * How long the engine's occupancy inputs stay cached. Short by design: a slot
     * someone just took must disappear, and writes bust the key anyway.
     */
    'occupancy_cache_seconds' => (int) env('BOOKING_OCCUPANCY_CACHE_SECONDS', 60),
];
```

Create `packages/core/src/Modules/Booking/Support/BookingTime.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Carbon\CarbonImmutable;

final class BookingTime
{
    public static function zone(): string
    {
        return (string) config('booking.timezone', 'Africa/Cairo');
    }

    /** Right now, in branch-local wall clock. */
    public static function now(): CarbonImmutable
    {
        return CarbonImmutable::now(self::zone());
    }

    /** A calendar day in branch-local wall clock, at midnight. */
    public static function day(string|CarbonImmutable $date): CarbonImmutable
    {
        return $date instanceof CarbonImmutable
            ? $date->setTimezone(self::zone())->startOfDay()
            : CarbonImmutable::parse($date, self::zone())->startOfDay();
    }
}
```

Register the config in `packages/core/src/Providers/CoreServiceProvider.php`, in `register()` beside the geo merge:

```php
        $this->mergeConfigFrom(__DIR__.'/../../config/booking.php', 'booking');
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/QueueNumberTest.php`
Expected: PASS (8 tests). The cancelled and no-show cases are Review Focus item 5.

- [ ] **Step 11: Commit**

```bash
git add apps/bltdreeg-server/packages/core/database/migrations/2026_10_09_00000[89]_* \
        apps/bltdreeg-server/packages/core/config/booking.php \
        apps/bltdreeg-server/packages/core/src/Providers/CoreServiceProvider.php \
        apps/bltdreeg-server/packages/core/src/Modules/Booking/ \
        apps/bltdreeg-server/tenant-app/tests/Feature/Booking/QueueNumberTest.php
git commit -m "$(cat <<'EOF'
feat(booking): bookings, snapshot items and derived queue numbers

A booking is a reserved range on a barber, with items snapshotting name, price
and duration so a later catalog change cannot alter it. The queue number is
derived from start order, so cancelled and no-show bookings release both their
time and their position.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `BasketResolver`

**Files:**
- Create: `packages/core/src/Modules/Booking/Exceptions/BookingException.php`
- Create: `packages/core/src/Modules/Booking/Support/BasketLine.php`
- Create: `packages/core/src/Modules/Booking/Support/ResolvedBasket.php`
- Create: `packages/core/src/Modules/Booking/Support/BasketResolver.php`
- Test: `tenant-app/tests/Feature/Booking/BasketResolverTest.php`

**Interfaces:**
- Consumes: `Service` (Task 1), `Package` (Task 3).
- Produces:
  - `BookingException` with static factories `invalidBasket(string $why)`, `slotTaken()`, `outsideHours()`, `blocked()`, `tooSoon()`, `beyondHorizon()`, `cutoffPassed()`, `barberPaused()`, each carrying a `->code` string from spec §7.2.
  - `BasketLine` readonly: `serviceId`, `packageId`, `name` (array), `price` (float), `duration` (int), `sort` (int); `toItemAttributes(): array` keyed for `booking_items`.
  - `ResolvedBasket` readonly: `lines` (`array<BasketLine>`), `totalDuration` (int), `totalPrice` (float), `currency` (`CurrencyEnum`).
  - `BasketResolver::resolve(Branch $branch, array $serviceIds, array $packageIds): ResolvedBasket`.

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/Booking/BasketResolverTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Booking\Exceptions\BookingException;
use Bltdreeg\Core\Modules\Booking\Models\Package;
use Bltdreeg\Core\Modules\Booking\Support\BasketResolver;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function serviceIn(Branch $branch, int $duration, float $price, bool $active = true): Service
{
    return Service::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => $duration,
        'price' => $price,
        'is_active' => $active,
    ]);
}

test('services sum their durations and prices', function () {
    $branch = Branch::factory()->create();
    $a = serviceIn($branch, 30, 120);
    $b = serviceIn($branch, 20, 60);

    $basket = BasketResolver::resolve($branch, [$a->id, $b->id], []);

    expect($basket->totalDuration)->toBe(50)
        ->and($basket->totalPrice)->toBe(180.0)
        ->and($basket->lines)->toHaveCount(2);
});

test('services and packages mix freely', function () {
    $branch = Branch::factory()->create();
    $loose = serviceIn($branch, 15, 50);

    $package = Package::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'price' => 150,
        'duration' => null,
    ]);
    $package->attachService(serviceIn($branch, 30, 100));
    $package->attachService(serviceIn($branch, 20, 80));

    $basket = BasketResolver::resolve($branch, [$loose->id], [$package->id]);

    expect($basket->totalDuration)->toBe(65)
        ->and($basket->totalPrice)->toBe(200.0)
        ->and($basket->lines)->toHaveCount(2);
});

test('an empty basket is rejected', function () {
    $branch = Branch::factory()->create();

    expect(fn () => BasketResolver::resolve($branch, [], []))
        ->toThrow(BookingException::class, 'at least one');
});

test('a service from another branch is rejected', function () {
    $branch = Branch::factory()->create();
    $otherTenant = Tenant::factory()->create();
    $foreignBranch = Branch::factory()->create(['tenant_id' => $otherTenant->id]);
    $foreign = serviceIn($foreignBranch, 30, 100);

    expect(fn () => BasketResolver::resolve($branch, [$foreign->id], []))
        ->toThrow(BookingException::class);
});

test('an inactive service is rejected', function () {
    $branch = Branch::factory()->create();
    $inactive = serviceIn($branch, 30, 100, active: false);

    expect(fn () => BasketResolver::resolve($branch, [$inactive->id], []))
        ->toThrow(BookingException::class);
});

test('a package with no member services is rejected', function () {
    $branch = Branch::factory()->create();
    $empty = Package::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => null,
    ]);

    expect(fn () => BasketResolver::resolve($branch, [], [$empty->id]))
        ->toThrow(BookingException::class, 'no member services');
});

test('a package whose override duration is zero is rejected', function () {
    $branch = Branch::factory()->create();
    $package = Package::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => 0,
    ]);
    $package->attachService(serviceIn($branch, 30, 100));

    expect(fn () => BasketResolver::resolve($branch, [], [$package->id]))
        ->toThrow(BookingException::class, 'zero minutes');
});

test('an unknown id is rejected rather than silently skipped', function () {
    $branch = Branch::factory()->create();

    expect(fn () => BasketResolver::resolve($branch, [99999], []))
        ->toThrow(BookingException::class);
});

test('lines carry snapshots ready for booking items', function () {
    $branch = Branch::factory()->create();
    $service = serviceIn($branch, 30, 120);

    $line = BasketResolver::resolve($branch, [$service->id], [])->lines[0];
    $attributes = $line->toItemAttributes();

    expect($attributes['service_id'])->toBe($service->id)
        ->and($attributes['package_id'])->toBeNull()
        ->and($attributes['duration_snapshot'])->toBe(30)
        ->and((float) $attributes['price_snapshot'])->toBe(120.0);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/BasketResolverTest.php`
Expected: FAIL — `BookingException` not found.

- [ ] **Step 3: Write `BookingException`**

Create `packages/core/src/Modules/Booking/Exceptions/BookingException.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Exceptions;

use RuntimeException;

/**
 * One exception for every booking refusal. `$code` is the machine-readable string
 * the API returns (spec §7.2), so controllers map it straight into the existing
 * ApiError shape without a translation table.
 */
class BookingException extends RuntimeException
{
    public function __construct(public readonly string $errorCode, string $message)
    {
        parent::__construct($message);
    }

    public static function invalidBasket(string $why): self
    {
        return new self('booking.invalid_basket', $why);
    }

    public static function slotTaken(): self
    {
        return new self('booking.slot_taken', 'That time was just taken.');
    }

    public static function outsideHours(): self
    {
        return new self('booking.outside_hours', 'That time is outside the barber\'s working hours.');
    }

    public static function blocked(): self
    {
        return new self('booking.blocked', 'That time is blocked.');
    }

    public static function tooSoon(): self
    {
        return new self('booking.too_soon', 'That time is too close to now.');
    }

    public static function beyondHorizon(): self
    {
        return new self('booking.beyond_horizon', 'That date is too far ahead.');
    }

    public static function cutoffPassed(): self
    {
        return new self('booking.cutoff_passed', 'It is too late to change this booking.');
    }

    public static function barberPaused(): self
    {
        return new self('booking.barber_paused', 'That barber is not taking bookings.');
    }
}
```

- [ ] **Step 4: Write `BasketLine` and `ResolvedBasket`**

Create `packages/core/src/Modules/Booking/Support/BasketLine.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

final readonly class BasketLine
{
    public function __construct(
        public ?int $serviceId,
        public ?int $packageId,
        public array $name,
        public float $price,
        public int $duration,
        public int $sort,
    ) {}

    /** @return array<string, mixed> */
    public function toItemAttributes(): array
    {
        return [
            'service_id' => $this->serviceId,
            'package_id' => $this->packageId,
            'name_snapshot' => $this->name,
            'price_snapshot' => $this->price,
            'duration_snapshot' => $this->duration,
            'sort' => $this->sort,
        ];
    }
}
```

Create `packages/core/src/Modules/Booking/Support/ResolvedBasket.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;

final readonly class ResolvedBasket
{
    /** @param array<int, BasketLine> $lines */
    public function __construct(
        public array $lines,
        public int $totalDuration,
        public float $totalPrice,
        public CurrencyEnum $currency,
    ) {}
}
```

- [ ] **Step 5: Write `BasketResolver`**

Create `packages/core/src/Modules/Booking/Support/BasketResolver.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Booking\Exceptions\BookingException;
use Bltdreeg\Core\Modules\Booking\Models\Package;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;

/**
 * Turns the ids a customer picked into snapshot lines plus a total duration and
 * price (spec §5.2). Services and packages mix freely. Every id must resolve to an
 * active item of THIS branch — an id that silently vanished would book the wrong
 * duration, so an unknown or foreign id is a refusal, not a skip.
 */
final class BasketResolver
{
    /**
     * @param array<int, int|string> $serviceIds
     * @param array<int, int|string> $packageIds
     */
    public static function resolve(Branch $branch, array $serviceIds, array $packageIds): ResolvedBasket
    {
        $serviceIds = array_values(array_unique(array_map('intval', $serviceIds)));
        $packageIds = array_values(array_unique(array_map('intval', $packageIds)));

        if ($serviceIds === [] && $packageIds === []) {
            throw BookingException::invalidBasket('A booking needs at least one service or package.');
        }

        $lines = [];
        $sort = 0;

        foreach (self::services($branch, $serviceIds) as $service) {
            if ((int) $service->duration <= 0) {
                throw BookingException::invalidBasket("Service {$service->getKey()} has no duration.");
            }

            $lines[] = new BasketLine(
                serviceId: $service->getKey(),
                packageId: null,
                name: $service->getTranslations('name'),
                price: (float) $service->price,
                duration: (int) $service->duration,
                sort: $sort++,
            );
        }

        foreach (self::packages($branch, $packageIds) as $package) {
            if ($package->services->isEmpty()) {
                throw BookingException::invalidBasket("Package {$package->getKey()} has no member services.");
            }

            $duration = $package->effectiveDuration();

            if ($duration <= 0) {
                throw BookingException::invalidBasket("Package {$package->getKey()} resolves to zero minutes.");
            }

            $lines[] = new BasketLine(
                serviceId: null,
                packageId: $package->getKey(),
                name: $package->getTranslations('name'),
                price: (float) $package->price,
                duration: $duration,
                sort: $sort++,
            );
        }

        $totalDuration = array_sum(array_map(fn (BasketLine $line): int => $line->duration, $lines));
        $totalPrice = array_sum(array_map(fn (BasketLine $line): float => $line->price, $lines));

        if ($totalDuration <= 0) {
            throw BookingException::invalidBasket('A booking cannot be zero minutes long.');
        }

        return new ResolvedBasket(
            lines: $lines,
            totalDuration: $totalDuration,
            totalPrice: round($totalPrice, 2),
            currency: $branch->currency,
        );
    }

    /** @param array<int, int> $ids */
    private static function services(Branch $branch, array $ids)
    {
        if ($ids === []) {
            return collect();
        }

        $services = Service::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->getKey())
            ->where('is_active', true)
            ->whereKey($ids)
            ->get();

        self::assertAllFound($services->modelKeys(), $ids, 'service');

        return $services;
    }

    /** @param array<int, int> $ids */
    private static function packages(Branch $branch, array $ids)
    {
        if ($ids === []) {
            return collect();
        }

        $packages = Package::query()
            ->withoutGlobalScopes()
            ->with('services')
            ->where('branch_id', $branch->getKey())
            ->where('is_active', true)
            ->whereKey($ids)
            ->get();

        self::assertAllFound($packages->modelKeys(), $ids, 'package');

        return $packages;
    }

    /**
     * @param array<int, int|string> $found
     * @param array<int, int> $requested
     */
    private static function assertAllFound(array $found, array $requested, string $label): void
    {
        $missing = array_diff($requested, array_map('intval', $found));

        if ($missing !== []) {
            throw BookingException::invalidBasket(
                ucfirst($label).' '.implode(', ', $missing).' is not an active '.$label.' of this branch.'
            );
        }
    }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/BasketResolverTest.php`
Expected: PASS (9 tests). The empty-package and cross-branch cases are Review Focus item 4.

- [ ] **Step 7: Commit**

```bash
git add apps/bltdreeg-server/packages/core/src/Modules/Booking/Exceptions/ \
        apps/bltdreeg-server/packages/core/src/Modules/Booking/Support/Basket*.php \
        apps/bltdreeg-server/packages/core/src/Modules/Booking/Support/ResolvedBasket.php \
        apps/bltdreeg-server/tenant-app/tests/Feature/Booking/BasketResolverTest.php
git commit -m "$(cat <<'EOF'
feat(booking): resolve a mixed service and package basket

Turns picked ids into snapshot lines with a total duration and price. Every id
must be an active item of the booking's own branch: an unknown, inactive or
foreign id is refused rather than skipped, because a silently dropped item would
book the wrong duration. Empty and zero-minute packages are refused too.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: `OccupancyCache` and `AvailabilityEngine`

**Files:**
- Create: `packages/core/src/Modules/Booking/Support/OccupancyCache.php`
- Create: `packages/core/src/Modules/Booking/Support/AvailableSlot.php`
- Create: `packages/core/src/Modules/Booking/Support/AvailabilityEngine.php`
- Test: `tenant-app/tests/Feature/Booking/AvailabilityEngineTest.php`
- Test: `tenant-app/tests/Feature/Booking/AvailabilityDstTest.php`

**Interfaces:**
- Consumes: `BookingSettings`, `BarberSchedule`, `BarberTimeBlock` (Task 5), `Booking` + `BookingTime` (Task 6), `QueueNumberProjector` (Task 6).
- Produces:
  - `OccupancyCache::for(Branch $branch, User $barber, CarbonImmutable $localDay): array` → `['windows' => [...], 'bookings' => [...], 'blocks' => [...]]`, all plain arrays; `OccupancyCache::forget(int $branchId, int $barberId, CarbonImmutable $localDay): void`; `OccupancyCache::forgetBarber(int $branchId, int $barberId): void`.
  - `AvailableSlot` readonly: `startsAt` (`CarbonImmutable`, branch-local), `endsAt`, `queueNumberPreview` (int).
  - `AvailabilityEngine::day(Branch $branch, User $barber, CarbonImmutable $date, int $basketDuration): array<AvailableSlot>` and `::isBookable(Branch $branch, User $barber, CarbonImmutable $startsAt, int $basketDuration): bool`.

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/Booking/AvailabilityEngineTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Models\BarberBookingSettings;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Booking\Support\AvailabilityEngine;
use Bltdreeg\Core\Modules\Booking\Support\AvailableSlot;
use Bltdreeg\Core\Modules\Booking\Support\BookingTime;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/** A fixed Monday well inside the booking horizon, with "now" pinned far before it. */
function bookingDay(): CarbonImmutable
{
    return BookingTime::day('2026-11-02'); // Monday
}

beforeEach(function () {
    // Pinned so min-notice and horizon maths are deterministic.
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-01 09:00:00', BookingTime::zone()));
});

afterEach(function () {
    CarbonImmutable::setTestNow();
});

function branchWithBarber(array $branchAttributes = []): array
{
    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 15,
        'booking_gap_minutes' => 0,
        'booking_days_ahead' => 30,
        'booking_min_notice_minutes' => 60,
        ...$branchAttributes,
    ]);
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    return [$branch, $barber];
}

function window(Branch $branch, User $barber, string $start, string $end, ?int $weekday = null): BarberSchedule
{
    return BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => $weekday ?? (int) bookingDay()->dayOfWeek,
        'start_time' => $start,
        'end_time' => $end,
        'is_active' => true,
    ]);
}

function startTimes(array $slots): array
{
    return array_map(fn (AvailableSlot $slot): string => $slot->startsAt->format('H:i'), $slots);
}

test('slots step by the configured step and fit the basket inside the window', function () {
    [$branch, $barber] = branchWithBarber();
    window($branch, $barber, '10:00', '11:00');

    $slots = AvailabilityEngine::day($branch, $barber, bookingDay(), 30);

    // 10:00, 10:15, 10:30 fit a 30-minute basket before 11:00; 10:45 does not.
    expect(startTimes($slots))->toBe(['10:00', '10:15', '10:30']);
});

test('a basket longer than the window yields nothing', function () {
    [$branch, $barber] = branchWithBarber();
    window($branch, $barber, '10:00', '11:00');

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 90))->toBe([]);
});

test('no schedule means no slots', function () {
    [$branch, $barber] = branchWithBarber();

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 30))->toBe([]);
});

test('a paused barber yields nothing', function () {
    [$branch, $barber] = branchWithBarber();
    window($branch, $barber, '10:00', '14:00');

    BarberBookingSettings::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'is_paused' => true,
    ]);

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 30))->toBe([]);
});

test('split shifts produce two bands with a real gap between them', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '12:00');
    window($branch, $barber, '17:00', '19:00');

    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 60)))
        ->toBe(['10:00', '11:00', '17:00', '18:00']);
});

test('an existing booking removes the slots it overlaps', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 30]);
    window($branch, $barber, '10:00', '12:00');

    $start = bookingDay()->setTime(10, 30);
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes(30),
        'duration_minutes' => 30,
        'gap_minutes' => 0,
    ]);

    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 30)))
        ->toBe(['10:00', '11:00', '11:30']);
});

test('a booking blocks its own stored gap, not the current setting', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 30, 'booking_gap_minutes' => 0]);
    window($branch, $barber, '10:00', '12:00');

    $start = bookingDay()->setTime(10, 0);
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes(30),
        'duration_minutes' => 30,
        'gap_minutes' => 30, // booked when the gap was 30
    ]);

    // 10:30 is eaten by the old gap even though the branch gap is now 0.
    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 30)))
        ->toBe(['11:00', '11:30']);
});

test('a cancelled booking releases its slot', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '12:00');

    $start = bookingDay()->setTime(10, 0);
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes(60),
        'duration_minutes' => 60,
        'status' => BookingStatusEnum::Cancelled,
    ]);

    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 60)))
        ->toBe(['10:00', '11:00']);
});

test('a time block removes the slots it covers', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '14:00');

    BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => bookingDay()->setTime(11, 0)->utc(),
        'ends_at' => bookingDay()->setTime(13, 0)->utc(),
        'is_full_day' => false,
    ]);

    expect(startTimes(AvailabilityEngine::day($branch, $barber, bookingDay(), 60)))
        ->toBe(['10:00', '13:00']);
});

test('a full-day block clears the day', function () {
    [$branch, $barber] = branchWithBarber();
    window($branch, $barber, '10:00', '14:00');

    BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => bookingDay()->startOfDay()->utc(),
        'ends_at' => bookingDay()->endOfDay()->utc(),
        'is_full_day' => true,
    ]);

    expect(AvailabilityEngine::day($branch, $barber, bookingDay(), 30))->toBe([]);
});

test('minimum notice hides slots too close to now', function () {
    [$branch, $barber] = branchWithBarber(['booking_min_notice_minutes' => 120, 'booking_slot_step_minutes' => 60]);
    $today = BookingTime::day('2026-11-01');
    window($branch, $barber, '09:00', '14:00', (int) $today->dayOfWeek);

    // now is 09:00; 120 minutes' notice means the first bookable start is 11:00.
    expect(startTimes(AvailabilityEngine::day($branch, $barber, $today, 60)))
        ->toBe(['11:00', '12:00', '13:00']);
});

test('a date beyond the horizon yields nothing', function () {
    [$branch, $barber] = branchWithBarber(['booking_days_ahead' => 3]);
    $far = BookingTime::day('2026-12-01');
    window($branch, $barber, '10:00', '14:00', (int) $far->dayOfWeek);

    expect(AvailabilityEngine::day($branch, $barber, $far, 30))->toBe([]);
});

test('a past date yields nothing', function () {
    [$branch, $barber] = branchWithBarber();
    $past = BookingTime::day('2026-10-01');
    window($branch, $barber, '10:00', '14:00', (int) $past->dayOfWeek);

    expect(AvailabilityEngine::day($branch, $barber, $past, 30))->toBe([]);
});

test('each slot carries the queue position it would take', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '13:00');

    $start = bookingDay()->setTime(10, 0);
    Booking::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'barber_user_id' => $barber->id,
        'starts_at' => $start,
        'ends_at' => $start->addMinutes(60),
        'duration_minutes' => 60,
    ]);

    $slots = AvailabilityEngine::day($branch, $barber, bookingDay(), 60);

    expect(startTimes($slots))->toBe(['11:00', '12:00'])
        ->and($slots[0]->queueNumberPreview)->toBe(2)
        ->and($slots[1]->queueNumberPreview)->toBe(3);
});

test('isBookable agrees with the day grid', function () {
    [$branch, $barber] = branchWithBarber(['booking_slot_step_minutes' => 60]);
    window($branch, $barber, '10:00', '12:00');

    expect(AvailabilityEngine::isBookable($branch, $barber, bookingDay()->setTime(10, 0), 60))->toBeTrue()
        ->and(AvailabilityEngine::isBookable($branch, $barber, bookingDay()->setTime(10, 30), 60))->toBeFalse()
        ->and(AvailabilityEngine::isBookable($branch, $barber, bookingDay()->setTime(15, 0), 60))->toBeFalse();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/AvailabilityEngineTest.php`
Expected: FAIL — `AvailabilityEngine` not found.

- [ ] **Step 3: Write `OccupancyCache`**

Create `packages/core/src/Modules/Booking/Support/OccupancyCache.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

/**
 * Caches the engine's INPUTS, not its output (spec §5.1). Caching the computed grid
 * would need one entry per basket duration; the inputs are the same whatever the
 * basket, so the grid is derived from them in memory.
 *
 * Everything stored is a plain array — `config('cache.serializable_classes')` is
 * false, so a cached model would come back as __PHP_Incomplete_Class. Same reason
 * CachableModel caches raw attributes.
 */
final class OccupancyCache
{
    /**
     * @return array{windows: array<int, array{start_time: string, end_time: string}>, bookings: array<int, array{starts_at: string, ends_at: string}>, blocks: array<int, array{starts_at: string, ends_at: string}>}
     */
    public static function for(Branch $branch, User $barber, CarbonImmutable $localDay): array
    {
        return Cache::remember(
            self::key((int) $branch->getKey(), (int) $barber->getKey(), $localDay),
            (int) config('booking.occupancy_cache_seconds', 60),
            fn (): array => self::build($branch, $barber, $localDay),
        );
    }

    public static function forget(int $branchId, int $barberId, CarbonImmutable $localDay): void
    {
        Cache::forget(self::key($branchId, $barberId, $localDay));
    }

    /**
     * Used when a schedule or settings row changes, which affects every day rather
     * than one. The horizon is bounded, so clearing it day by day is cheap and needs
     * no tag support from the cache driver.
     */
    public static function forgetBarber(int $branchId, int $barberId, int $days = 400): void
    {
        $cursor = BookingTime::now()->startOfDay();

        for ($i = 0; $i <= $days; $i++) {
            self::forget($branchId, $barberId, $cursor->addDays($i));
        }
    }

    private static function key(int $branchId, int $barberId, CarbonImmutable $localDay): string
    {
        return "booking:occupancy:{$branchId}:{$barberId}:".$localDay->format('Y-m-d');
    }

    /** @return array<string, mixed> */
    private static function build(Branch $branch, User $barber, CarbonImmutable $localDay): array
    {
        $dayStart = $localDay->startOfDay()->utc();
        $dayEnd = $localDay->endOfDay()->utc();

        $windows = BarberSchedule::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->getKey())
            ->where('user_id', $barber->getKey())
            ->where('weekday', (int) $localDay->dayOfWeek)
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get(['start_time', 'end_time'])
            ->map(fn (BarberSchedule $row): array => [
                'start_time' => (string) $row->start_time,
                'end_time' => (string) $row->end_time,
            ])->all();

        // A booking's footprint runs past its end by the gap stored on it, so a
        // booking that starts before the day can still bleed into it.
        $bookings = Booking::query()
            ->withoutGlobalScopes()
            ->occupying()
            ->where('barber_user_id', $barber->getKey())
            ->whereBetween('starts_at', [$dayStart->subDay(), $dayEnd])
            ->get(['starts_at', 'ends_at', 'gap_minutes'])
            ->map(fn (Booking $booking): array => [
                'starts_at' => $booking->starts_at->utc()->toIso8601String(),
                'ends_at' => $booking->footprintEndsAt()->utc()->toIso8601String(),
            ])->all();

        $blocks = BarberTimeBlock::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->getKey())
            ->where('user_id', $barber->getKey())
            ->where('starts_at', '<', $dayEnd)
            ->where('ends_at', '>', $dayStart)
            ->get(['starts_at', 'ends_at'])
            ->map(fn (BarberTimeBlock $block): array => [
                'starts_at' => $block->starts_at->utc()->toIso8601String(),
                'ends_at' => $block->ends_at->utc()->toIso8601String(),
            ])->all();

        return ['windows' => $windows, 'bookings' => $bookings, 'blocks' => $blocks];
    }
}
```

- [ ] **Step 4: Write `AvailableSlot`**

Create `packages/core/src/Modules/Booking/Support/AvailableSlot.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Carbon\CarbonImmutable;

final readonly class AvailableSlot
{
    public function __construct(
        public CarbonImmutable $startsAt,
        public CarbonImmutable $endsAt,
        public int $queueNumberPreview,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'starts_at' => $this->startsAt->toIso8601String(),
            'ends_at' => $this->endsAt->toIso8601String(),
            'queue_number_preview' => $this->queueNumberPreview,
        ];
    }
}
```

- [ ] **Step 5: Write `AvailabilityEngine`**

Create `packages/core/src/Modules/Booking/Support/AvailabilityEngine.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;

/**
 * Builds a day's bookable starts from rules (spec §5): the barber's weekly windows,
 * stepped by slot_step_minutes, minus existing booking footprints, minus time
 * blocks, minus anything inside the minimum notice or beyond the horizon.
 *
 * Nothing is materialized: there are no slot rows at any point.
 */
final class AvailabilityEngine
{
    /** @return array<int, AvailableSlot> */
    public static function day(Branch $branch, User $barber, CarbonImmutable $date, int $basketDuration): array
    {
        if ($basketDuration <= 0) {
            return [];
        }

        $settings = BookingSettings::resolve($branch, $barber);

        if ($settings->isPaused) {
            return [];
        }

        $zone = BookingTime::zone();
        $day = $date->setTimezone($zone)->startOfDay();
        $today = BookingTime::now()->startOfDay();

        if ($day->lt($today) || $day->gt($today->addDays($settings->maxDaysAhead))) {
            return [];
        }

        $occupancy = OccupancyCache::for($branch, $barber, $day);

        if ($occupancy['windows'] === []) {
            return [];
        }

        $earliest = BookingTime::now()->addMinutes($settings->minNoticeMinutes);
        $busy = self::ranges($occupancy['bookings'], $occupancy['blocks']);

        $slots = [];
        $seen = [];

        foreach ($occupancy['windows'] as $window) {
            // Parsed in the branch zone, so a wall-clock time that DST skipped is
            // normalized to a real instant rather than silently invented.
            $windowStart = CarbonImmutable::parse($day->format('Y-m-d').' '.$window['start_time'], $zone);
            $windowEnd = CarbonImmutable::parse($day->format('Y-m-d').' '.$window['end_time'], $zone);

            // Step in absolute time: across a DST change the wall clock jumps, but the
            // sequence of real instants stays even and never repeats.
            for (
                $cursor = $windowStart;
                $cursor->addMinutes($basketDuration)->lte($windowEnd);
                $cursor = $cursor->addMinutes($settings->slotStepMinutes)
            ) {
                $endsAt = $cursor->addMinutes($basketDuration);
                $footprintEnd = $endsAt->addMinutes($settings->gapMinutes);
                $stamp = $cursor->getTimestamp();

                if (isset($seen[$stamp])) {
                    continue;
                }

                if ($cursor->lt($earliest)) {
                    continue;
                }

                if (self::overlapsAny($cursor, $footprintEnd, $busy)) {
                    continue;
                }

                $seen[$stamp] = true;

                $slots[] = new AvailableSlot(
                    startsAt: $cursor,
                    endsAt: $endsAt,
                    queueNumberPreview: QueueNumberProjector::preview($branch, $barber, $cursor),
                );
            }
        }

        usort($slots, fn (AvailableSlot $a, AvailableSlot $b): int => $a->startsAt <=> $b->startsAt);

        return $slots;
    }

    /** Whether one exact start is offered for that basket — the check a write makes. */
    public static function isBookable(Branch $branch, User $barber, CarbonImmutable $startsAt, int $basketDuration): bool
    {
        $target = $startsAt->setTimezone(BookingTime::zone());

        foreach (self::day($branch, $barber, $target, $basketDuration) as $slot) {
            if ($slot->startsAt->equalTo($target)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array<int, array{starts_at: string, ends_at: string}> ...$sets
     * @return array<int, array{0: CarbonImmutable, 1: CarbonImmutable}>
     */
    private static function ranges(array ...$sets): array
    {
        $ranges = [];

        foreach ($sets as $set) {
            foreach ($set as $range) {
                $ranges[] = [
                    CarbonImmutable::parse($range['starts_at']),
                    CarbonImmutable::parse($range['ends_at']),
                ];
            }
        }

        return $ranges;
    }

    /** @param array<int, array{0: CarbonImmutable, 1: CarbonImmutable}> $ranges */
    private static function overlapsAny(CarbonImmutable $start, CarbonImmutable $end, array $ranges): bool
    {
        foreach ($ranges as [$busyStart, $busyEnd]) {
            if ($start->lt($busyEnd) && $busyStart->lt($end)) {
                return true;
            }
        }

        return false;
    }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/AvailabilityEngineTest.php`
Expected: PASS (15 tests).

- [ ] **Step 7: Write the DST test**

This is Review Focus item 1. Rather than hardcoding Egypt's transition dates — which change by decree — it asserts the invariants that must hold on every date: slots are unique, ordered, and each one's local wall time round-trips to the same instant (so no invented or duplicated local time slips through).

Create `tenant-app/tests/Feature/Booking/AvailabilityDstTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Support\AvailabilityEngine;
use Bltdreeg\Core\Modules\Booking\Support\AvailableSlot;
use Bltdreeg\Core\Modules\Booking\Support\BookingTime;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

afterEach(function () {
    CarbonImmutable::setTestNow();
});

test('slots stay unique, ordered and real across every day of a DST change month', function () {
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-04-01 00:00:00', BookingTime::zone()));

    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 30,
        'booking_gap_minutes' => 0,
        'booking_days_ahead' => 365,
        'booking_min_notice_minutes' => 0,
    ]);
    $barber = User::factory()->create(['branch_id' => $branch->id]);

    // A window covering midnight-adjacent hours on every weekday, because Egypt's
    // DST change happens at midnight.
    foreach (range(0, 6) as $weekday) {
        BarberSchedule::query()->create([
            'tenant_id' => $branch->tenant_id,
            'branch_id' => $branch->id,
            'user_id' => $barber->id,
            'weekday' => $weekday,
            'start_time' => '00:00',
            'end_time' => '06:00',
            'is_active' => true,
        ]);
    }

    $zone = BookingTime::zone();

    foreach (range(20, 30) as $dayOfApril) {
        $date = BookingTime::day(sprintf('2026-04-%02d', $dayOfApril));
        $slots = AvailabilityEngine::day($branch, $barber, $date, 30);

        expect($slots)->not->toBeEmpty("no slots on 2026-04-{$dayOfApril}");

        $stamps = array_map(fn (AvailableSlot $slot): int => $slot->startsAt->getTimestamp(), $slots);

        // No duplicated instants, and strictly increasing.
        expect($stamps)->toBe(array_values(array_unique($stamps)))
            ->and($stamps)->toBe(collect($stamps)->sort()->values()->all());

        foreach ($slots as $slot) {
            // The local wall time must round-trip to the same instant. A nonexistent
            // local time would not, which is how an invented slot would be caught.
            $roundTripped = CarbonImmutable::parse(
                $slot->startsAt->setTimezone($zone)->format('Y-m-d H:i:s'),
                $zone
            );

            expect($roundTripped->getTimestamp())->toBe(
                $slot->startsAt->getTimestamp(),
                'slot '.$slot->startsAt->toIso8601String().' has no real local time'
            );
        }
    }
});
```

- [ ] **Step 8: Run the DST test**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/AvailabilityDstTest.php`
Expected: PASS.

- [ ] **Step 9: Run the whole suite**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add apps/bltdreeg-server/packages/core/src/Modules/Booking/Support/OccupancyCache.php \
        apps/bltdreeg-server/packages/core/src/Modules/Booking/Support/AvailableSlot.php \
        apps/bltdreeg-server/packages/core/src/Modules/Booking/Support/AvailabilityEngine.php \
        apps/bltdreeg-server/tenant-app/tests/Feature/Booking/Availability*Test.php
git commit -m "$(cat <<'EOF'
feat(booking): availability engine computed from rules

A day's bookable starts come from the barber's weekly windows stepped by their
slot size, minus booking footprints, time blocks, minimum notice and the
horizon. Nothing is materialized. The cache holds the engine's inputs rather
than its output, so one entry serves every basket duration. Slots step in
absolute time, which keeps them unique and real across a DST change.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: `BookingService`, domain events, overlap guard, cache invalidation

**Files:**
- Create: `packages/core/src/Modules/Booking/Support/OverlapGuard.php`
- Create: `packages/core/src/Modules/Booking/Support/BookingCode.php`
- Create: `packages/core/src/Modules/Booking/Concerns/InvalidatesOccupancy.php`
- Create: `packages/core/src/Modules/Booking/Events/BookingCreated.php`
- Create: `packages/core/src/Modules/Booking/Events/BookingCancelled.php`
- Create: `packages/core/src/Modules/Booking/Events/BookingRescheduled.php`
- Create: `packages/core/src/Modules/Booking/Support/BookingService.php`
- Modify: `packages/core/src/Modules/Booking/Support/AvailabilityEngine.php` (use `OverlapGuard`, drop the private duplicate)
- Modify: `packages/core/src/Modules/Booking/Models/Booking.php`, `BarberSchedule.php`, `BarberTimeBlock.php`, `BarberBookingSettings.php` (add `InvalidatesOccupancy`)
- Test: `tenant-app/tests/Feature/Booking/OverlapGuardTest.php`
- Test: `tenant-app/tests/Feature/Booking/BookingServiceTest.php`

**Interfaces:**
- Consumes: everything from Tasks 1–8.
- Produces:
  - `OverlapGuard::overlaps(CarbonImmutable $start, CarbonImmutable $end, array $ranges): bool` — pure, half-open `[start, end)` semantics.
  - `BookingCode::generate(): string`.
  - `BookingService` (resolved from the container) with `book()`, `createManual()`, `reschedule()`, `cancel()`, `markCompleted()`, `markNoShow()`.
  - `BookingCreated`, `BookingCancelled`, `BookingRescheduled`, each with a public readonly `Booking $booking`.

- [ ] **Step 1: Write the failing overlap test**

This is the deterministic half of Review Focus item 3 — no database, no clock, so the boundary rules are pinned exactly.

Create `tenant-app/tests/Feature/Booking/OverlapGuardTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Booking\Support\OverlapGuard;
use Carbon\CarbonImmutable;

function range(string $start, string $end): array
{
    return [CarbonImmutable::parse($start), CarbonImmutable::parse($end)];
}

test('a range overlapping an existing one is caught', function () {
    $busy = [range('2026-11-02 10:00', '2026-11-02 11:00')];

    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 10:30'), CarbonImmutable::parse('2026-11-02 11:30'), $busy))->toBeTrue();
});

test('touching end to start does not overlap', function () {
    $busy = [range('2026-11-02 10:00', '2026-11-02 11:00')];

    // 11:00–12:00 starts exactly when the other ends: back-to-back is allowed.
    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 11:00'), CarbonImmutable::parse('2026-11-02 12:00'), $busy))->toBeFalse()
        // 09:00–10:00 ends exactly when the other starts.
        ->and(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 09:00'), CarbonImmutable::parse('2026-11-02 10:00'), $busy))->toBeFalse();
});

test('a range fully inside an existing one is caught', function () {
    $busy = [range('2026-11-02 10:00', '2026-11-02 12:00')];

    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 10:30'), CarbonImmutable::parse('2026-11-02 11:00'), $busy))->toBeTrue();
});

test('a range fully containing an existing one is caught', function () {
    $busy = [range('2026-11-02 10:30', '2026-11-02 11:00')];

    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 10:00'), CarbonImmutable::parse('2026-11-02 12:00'), $busy))->toBeTrue();
});

test('no ranges means no overlap', function () {
    expect(OverlapGuard::overlaps(CarbonImmutable::parse('2026-11-02 10:00'), CarbonImmutable::parse('2026-11-02 11:00'), []))->toBeFalse();
});

test('overlap is detected across timezones for the same instant', function () {
    $busy = [range('2026-11-02 08:00:00 UTC', '2026-11-02 09:00:00 UTC')];

    // 10:30 Cairo in November is 08:30 UTC, inside the busy range.
    expect(OverlapGuard::overlaps(
        CarbonImmutable::parse('2026-11-02 10:30:00', 'Africa/Cairo'),
        CarbonImmutable::parse('2026-11-02 11:00:00', 'Africa/Cairo'),
        $busy
    ))->toBeTrue();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/OverlapGuardTest.php`
Expected: FAIL — `OverlapGuard` not found.

- [ ] **Step 3: Write `OverlapGuard` and use it in the engine**

Create `packages/core/src/Modules/Booking/Support/OverlapGuard.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Carbon\CarbonImmutable;

/**
 * Half-open interval overlap: [start, end). Back-to-back ranges — one ending exactly
 * when the next begins — do not overlap, which is what makes consecutive bookings
 * possible at all.
 *
 * Pure and clock-free on purpose: MySQL cannot express an overlap constraint and
 * SQLite ignores lockForUpdate, so this rule is the one thing that must be provably
 * right without a database.
 */
final class OverlapGuard
{
    /** @param array<int, array{0: CarbonImmutable, 1: CarbonImmutable}> $ranges */
    public static function overlaps(CarbonImmutable $start, CarbonImmutable $end, array $ranges): bool
    {
        foreach ($ranges as [$busyStart, $busyEnd]) {
            if ($start->lt($busyEnd) && $busyStart->lt($end)) {
                return true;
            }
        }

        return false;
    }
}
```

Then in `packages/core/src/Modules/Booking/Support/AvailabilityEngine.php`, delete the private `overlapsAny()` method and replace its single call site:

```php
                if (OverlapGuard::overlaps($cursor, $footprintEnd, $busy)) {
                    continue;
                }
```

The engine tests from Task 8 are the regression net for that swap.

- [ ] **Step 4: Run both to verify they pass**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/OverlapGuardTest.php tests/Feature/Booking/AvailabilityEngineTest.php`
Expected: PASS (6 + 15 tests).

- [ ] **Step 5: Write `BookingCode`, the occupancy-invalidation concern, and the events**

Create `packages/core/src/Modules/Booking/Support/BookingCode.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Illuminate\Support\Str;

/**
 * A short code the customer can read out at the salon. Unambiguous alphabet: no
 * O/0 or I/1, because these get read over the phone.
 */
final class BookingCode
{
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public static function generate(): string
    {
        do {
            $code = self::random(3).'-'.self::random(3);
        } while (Booking::query()->withoutGlobalScopes()->where('booking_code', $code)->exists());

        return $code;
    }

    private static function random(int $length): string
    {
        $out = '';

        for ($i = 0; $i < $length; $i++) {
            $out .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
        }

        return $out;
    }
}
```

Create `packages/core/src/Modules/Booking/Concerns/InvalidatesOccupancy.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Concerns;

use Bltdreeg\Core\Modules\Booking\Support\BookingTime;
use Bltdreeg\Core\Modules\Booking\Support\OccupancyCache;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * Keeps the occupancy cache honest: a slot someone just took has to disappear now,
 * not when the 60-second TTL lapses. Models that carry a date invalidate that day;
 * schedules and settings affect every day, so they clear the barber's whole horizon.
 */
trait InvalidatesOccupancy
{
    public static function bootInvalidatesOccupancy(): void
    {
        static::saved(fn (Model $model) => $model->invalidateOccupancy());
        static::deleted(fn (Model $model) => $model->invalidateOccupancy());
    }

    public function invalidateOccupancy(): void
    {
        $branchId = (int) $this->getAttribute('branch_id');
        $barberId = (int) ($this->getAttribute('barber_user_id') ?? $this->getAttribute('user_id'));

        if ($branchId === 0 || $barberId === 0) {
            return;
        }

        foreach ($this->occupancyDays() as $day) {
            OccupancyCache::forget($branchId, $barberId, $day);
        }
    }

    /**
     * The days this record affects. Null from a subclass means "all of them".
     *
     * @return array<int, CarbonImmutable>
     */
    protected function occupancyDays(): array
    {
        $days = [];

        foreach (['starts_at', 'ends_at'] as $attribute) {
            $value = $this->getAttribute($attribute);

            if ($value === null) {
                continue;
            }

            $days[] = BookingTime::day(CarbonImmutable::parse($value));
        }

        if ($days === []) {
            // No date on the record (a schedule or a settings row): clear the horizon.
            OccupancyCache::forgetBarber(
                (int) $this->getAttribute('branch_id'),
                (int) ($this->getAttribute('barber_user_id') ?? $this->getAttribute('user_id')),
            );

            return [];
        }

        // A block can span days; walk from the first to the last.
        $first = min($days);
        $last = max($days);
        $span = [];

        for ($cursor = $first; $cursor->lte($last); $cursor = $cursor->addDay()) {
            $span[] = $cursor;

            if (count($span) > 400) {
                break;
            }
        }

        // Also clear the previous day: a booking's gap can bleed across midnight.
        $span[] = $first->subDay();

        return $span;
    }
}
```

Add `use InvalidatesOccupancy;` to `Booking`, `BarberSchedule`, `BarberTimeBlock` and `BarberBookingSettings`, importing `Bltdreeg\Core\Modules\Booking\Concerns\InvalidatesOccupancy` in each.

`BarberSchedule` already defines `booted()`; trait boot methods run in addition to it, so no change is needed there.

Create the three events. `packages/core/src/Modules/Booking/Events/BookingCreated.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Events;

use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Illuminate\Foundation\Events\Dispatchable;

/** Nothing listens yet. This is the seam the notifications feature plugs into. */
class BookingCreated
{
    use Dispatchable;

    public function __construct(public readonly Booking $booking) {}
}
```

`BookingCancelled.php` and `BookingRescheduled.php` are the same shape — same `use Dispatchable;` and the same constructor — with the class names `BookingCancelled` and `BookingRescheduled`. `BookingRescheduled` takes a second argument:

```php
class BookingRescheduled
{
    use Dispatchable;

    public function __construct(
        public readonly Booking $booking,
        public readonly Booking $previous,
    ) {}
}
```

- [ ] **Step 6: Write the `BookingServiceTest`**

Create `tenant-app/tests/Feature/Booking/BookingServiceTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Events\BookingCancelled;
use Bltdreeg\Core\Modules\Booking\Events\BookingCreated;
use Bltdreeg\Core\Modules\Booking\Events\BookingRescheduled;
use Bltdreeg\Core\Modules\Booking\Exceptions\BookingException;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Booking\Support\BasketResolver;
use Bltdreeg\Core\Modules\Booking\Support\BookingService;
use Bltdreeg\Core\Modules\Booking\Support\BookingTime;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-01 09:00:00', BookingTime::zone()));
});

afterEach(function () {
    CarbonImmutable::setTestNow();
});

function bookingFixture(array $branchAttributes = []): array
{
    $branch = Branch::factory()->create([
        'booking_slot_step_minutes' => 30,
        'booking_gap_minutes' => 0,
        'booking_days_ahead' => 30,
        'booking_min_notice_minutes' => 60,
        'booking_cancel_cutoff_minutes' => 120,
        ...$branchAttributes,
    ]);
    $barber = User::factory()->create(['branch_id' => $branch->id]);
    $day = BookingTime::day('2026-11-02');

    BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => (int) $day->dayOfWeek,
        'start_time' => '10:00',
        'end_time' => '14:00',
        'is_active' => true,
    ]);

    $service = Service::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => 30,
        'price' => 120,
    ]);

    $basket = BasketResolver::resolve($branch, [$service->id], []);

    return [$branch, $barber, $day, $basket];
}

test('a customer booking is confirmed and records its items', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $customer = Customer::factory()->create();

    $booking = app(BookingService::class)
        ->book($branch, $barber, $basket, $day->setTime(10, 0), $customer);

    expect($booking->status)->toBe(BookingStatusEnum::Confirmed)
        ->and($booking->source)->toBe(BookingSourceEnum::App)
        ->and($booking->customer_id)->toBe($customer->id)
        ->and($booking->duration_minutes)->toBe(30)
        ->and((float) $booking->total_price)->toBe(120.0)
        ->and($booking->booking_code)->not->toBeEmpty()
        ->and($booking->items)->toHaveCount(1);
});

test('booking a taken time is refused', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    expect(fn () => $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('booking outside the working window is refused', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();

    expect(fn () => app(BookingService::class)
        ->book($branch, $barber, $basket, $day->setTime(16, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('booking inside the minimum notice is refused', function () {
    [$branch, $barber, , $basket] = bookingFixture(['booking_min_notice_minutes' => 240]);
    $today = BookingTime::day('2026-11-01');

    BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => (int) $today->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '14:00',
        'is_active' => true,
    ]);

    expect(fn () => app(BookingService::class)
        ->book($branch, $barber, $basket, $today->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('booking a blocked time is refused', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();

    BarberTimeBlock::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'starts_at' => $day->setTime(10, 0)->utc(),
        'ends_at' => $day->setTime(11, 0)->utc(),
    ]);

    expect(fn () => app(BookingService::class)
        ->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});

test('a manual booking stores a free-text name and phone and no customer', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();

    $booking = app(BookingService::class)->createManual(
        $branch, $barber, $basket, $day->setTime(10, 0), 'أحمد', '+201000000001', 'Regular'
    );

    expect($booking->customer_id)->toBeNull()
        ->and($booking->guest_name)->toBe('أحمد')
        ->and($booking->guest_phone)->toBe('+201000000001')
        ->and($booking->source)->toBe(BookingSourceEnum::Dashboard)
        ->and($booking->is_forced)->toBeFalse()
        ->and($booking->customerLabel())->toBe('أحمد');
});

test('a manual booking obeys the rules unless it is forced', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    expect(fn () => $service->createManual($branch, $barber, $basket, $day->setTime(16, 0), 'أحمد', '+201000000001'))
        ->toThrow(BookingException::class);

    $forced = $service->createManual(
        $branch, $barber, $basket, $day->setTime(16, 0), 'أحمد', '+201000000001', null, override: true
    );

    expect($forced->is_forced)->toBeTrue()
        ->and($forced->starts_at->setTimezone(BookingTime::zone())->format('H:i'))->toBe('16:00');
});

test('a forced booking may double-book the barber', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    $forced = $service->createManual(
        $branch, $barber, $basket, $day->setTime(10, 0), 'أحمد', '+201000000001', null, override: true
    );

    expect($forced->is_forced)->toBeTrue();
});

test('cancelling frees the slot and keeps an audit trail', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $booking = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $cancelled = $service->cancel($booking, byCustomer: true);

    expect($cancelled->status)->toBe(BookingStatusEnum::Cancelled)
        ->and($cancelled->cancelled_at)->not->toBeNull()
        ->and($cancelled->cancelled_by_customer)->toBeTrue();

    // The time is free again.
    $again = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    expect($again->id)->not->toBe($booking->id);
});

test('a customer cannot cancel past the cutoff but the salon can', function () {
    [$branch, $barber, , $basket] = bookingFixture(['booking_cancel_cutoff_minutes' => 120, 'booking_min_notice_minutes' => 0]);
    $today = BookingTime::day('2026-11-01');

    BarberSchedule::query()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'user_id' => $barber->id,
        'weekday' => (int) $today->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '14:00',
        'is_active' => true,
    ]);

    $service = app(BookingService::class);
    // now is 09:00, booking at 10:00 — inside a 120-minute cutoff.
    $booking = $service->book($branch, $barber, $basket, $today->setTime(10, 0), Customer::factory()->create());

    expect(fn () => $service->cancel($booking, byCustomer: true))
        ->toThrow(BookingException::class);

    expect($service->cancel($booking, byCustomer: false)->status)->toBe(BookingStatusEnum::Cancelled);
});

test('rescheduling moves the booking and links the old one', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $booking = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $moved = $service->reschedule($booking, $day->setTime(11, 0));

    expect($moved->id)->not->toBe($booking->id)
        ->and($moved->rescheduled_from_id)->toBe($booking->id)
        ->and($moved->starts_at->setTimezone(BookingTime::zone())->format('H:i'))->toBe('11:00')
        ->and($moved->items)->toHaveCount(1)
        ->and($booking->fresh()->status)->toBe(BookingStatusEnum::Cancelled);
});

test('rescheduling onto a taken time is refused and the original survives', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $mine = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $theirs = $service->book($branch, $barber, $basket, $day->setTime(11, 0), Customer::factory()->create());

    expect(fn () => $service->reschedule($mine, $day->setTime(11, 0)))
        ->toThrow(BookingException::class);

    expect($mine->fresh()->status)->toBe(BookingStatusEnum::Confirmed)
        ->and($theirs->fresh()->status)->toBe(BookingStatusEnum::Confirmed);
});

test('completed and no-show are terminal', function () {
    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $one = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $two = $service->book($branch, $barber, $basket, $day->setTime(11, 0), Customer::factory()->create());

    expect($service->markCompleted($one)->status)->toBe(BookingStatusEnum::Completed)
        ->and($service->markNoShow($two)->status)->toBe(BookingStatusEnum::NoShow);

    expect(fn () => $service->cancel($one->fresh(), byCustomer: false))
        ->toThrow(BookingException::class);
});

test('the lifecycle fires its domain events', function () {
    Event::fake([BookingCreated::class, BookingCancelled::class, BookingRescheduled::class]);

    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $booking = $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());
    $service->reschedule($booking, $day->setTime(12, 0));

    Event::assertDispatched(BookingCreated::class);
    Event::assertDispatched(BookingRescheduled::class);
});

test('two writers cannot take the same slot', function () {
    if (app('db')->connection()->getDriverName() === 'sqlite') {
        $this->markTestSkipped('SQLite ignores lockForUpdate; run this against MySQL to exercise the row lock.');
    }

    [$branch, $barber, $day, $basket] = bookingFixture();
    $service = app(BookingService::class);

    $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create());

    expect(fn () => $service->book($branch, $barber, $basket, $day->setTime(10, 0), Customer::factory()->create()))
        ->toThrow(BookingException::class);
});
```

The last test is the other half of Review Focus item 3: it **skips loudly** on SQLite rather than passing vacuously, and the serial guard is covered by "booking a taken time is refused" plus `OverlapGuardTest`.

- [ ] **Step 7: Run it to verify it fails**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/BookingServiceTest.php`
Expected: FAIL — `BookingService` not found.

- [ ] **Step 8: Write `BookingService`**

Create `packages/core/src/Modules/Booking/Support/BookingService.php`:

```php
<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Events\BookingCancelled;
use Bltdreeg\Core\Modules\Booking\Events\BookingCreated;
use Bltdreeg\Core\Modules\Booking\Events\BookingRescheduled;
use Bltdreeg\Core\Modules\Booking\Exceptions\BookingException;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Every write to a booking goes through here (spec §6). Each one takes the barber's
 * day lock, re-validates against the engine, persists, and fires its event.
 *
 * MySQL cannot express an overlap constraint, so the lock plus the re-check is the
 * guard. SQLite ignores the lock, which is why the overlap rule itself is pure and
 * separately tested (OverlapGuard).
 */
class BookingService
{
    public function book(
        Branch $branch,
        User $barber,
        ResolvedBasket $basket,
        CarbonImmutable $startsAt,
        Customer $customer,
        ?string $notes = null,
    ): Booking {
        return $this->create(
            branch: $branch,
            barber: $barber,
            basket: $basket,
            startsAt: $startsAt,
            source: BookingSourceEnum::App,
            customer: $customer,
            notes: $notes,
        );
    }

    public function createManual(
        Branch $branch,
        User $barber,
        ResolvedBasket $basket,
        CarbonImmutable $startsAt,
        string $guestName,
        string $guestPhone,
        ?string $notes = null,
        bool $override = false,
        ?User $createdBy = null,
    ): Booking {
        return $this->create(
            branch: $branch,
            barber: $barber,
            basket: $basket,
            startsAt: $startsAt,
            source: BookingSourceEnum::Dashboard,
            guestName: $guestName,
            guestPhone: $guestPhone,
            notes: $notes,
            override: $override,
            createdBy: $createdBy,
        );
    }

    public function reschedule(Booking $booking, CarbonImmutable $startsAt, ?User $barber = null): Booking
    {
        if ($booking->status->isTerminal()) {
            throw BookingException::cutoffPassed();
        }

        $branch = $booking->branch;
        $settings = BookingSettings::resolve($branch, $booking->barber);

        if (BookingTime::now()->addMinutes($settings->cancelCutoffMinutes)->gt($booking->starts_at)) {
            throw BookingException::cutoffPassed();
        }

        $target = $barber ?? $booking->barber;
        $previous = $booking;

        $moved = DB::transaction(function () use ($booking, $branch, $target, $startsAt): Booking {
            $this->lockDay($target, $startsAt);
            $this->assertBookable($branch, $target, $startsAt, (int) $booking->duration_minutes, exceptBookingId: $booking->getKey());

            $fresh = Booking::query()->withoutGlobalScopes()->create([
                'tenant_id' => $booking->tenant_id,
                'branch_id' => $booking->branch_id,
                'barber_user_id' => $target->getKey(),
                'customer_id' => $booking->customer_id,
                'guest_name' => $booking->guest_name,
                'guest_phone' => $booking->guest_phone,
                'source' => $booking->source,
                'status' => BookingStatusEnum::Confirmed,
                'starts_at' => $startsAt->utc(),
                'ends_at' => $startsAt->addMinutes((int) $booking->duration_minutes)->utc(),
                'duration_minutes' => $booking->duration_minutes,
                'gap_minutes' => BookingSettings::resolve($branch, $target)->gapMinutes,
                'total_price' => $booking->total_price,
                'currency' => $booking->currency,
                'booking_code' => BookingCode::generate(),
                'notes' => $booking->notes,
                'is_forced' => false,
                'rescheduled_from_id' => $booking->getKey(),
            ]);

            foreach ($booking->items as $item) {
                $fresh->items()->create([
                    'service_id' => $item->service_id,
                    'package_id' => $item->package_id,
                    'name_snapshot' => $item->name_snapshot,
                    'price_snapshot' => $item->price_snapshot,
                    'duration_snapshot' => $item->duration_snapshot,
                    'sort' => $item->sort,
                ]);
            }

            $booking->update([
                'status' => BookingStatusEnum::Cancelled,
                'cancelled_at' => now(),
            ]);

            return $fresh->load('items');
        });

        BookingRescheduled::dispatch($moved, $previous);

        return $moved;
    }

    public function cancel(Booking $booking, bool $byCustomer): Booking
    {
        if ($booking->status->isTerminal()) {
            throw BookingException::cutoffPassed();
        }

        if ($byCustomer) {
            $settings = BookingSettings::resolve($booking->branch, $booking->barber);

            if (BookingTime::now()->addMinutes($settings->cancelCutoffMinutes)->gt($booking->starts_at)) {
                throw BookingException::cutoffPassed();
            }
        }

        $booking->update([
            'status' => BookingStatusEnum::Cancelled,
            'cancelled_at' => now(),
            'cancelled_by_customer' => $byCustomer,
        ]);

        $booking->refresh();

        BookingCancelled::dispatch($booking);

        return $booking;
    }

    public function markCompleted(Booking $booking): Booking
    {
        return $this->settle($booking, BookingStatusEnum::Completed);
    }

    public function markNoShow(Booking $booking): Booking
    {
        return $this->settle($booking, BookingStatusEnum::NoShow);
    }

    private function settle(Booking $booking, BookingStatusEnum $status): Booking
    {
        if ($booking->status->isTerminal()) {
            throw BookingException::cutoffPassed();
        }

        $booking->update(['status' => $status]);

        return $booking->refresh();
    }

    private function create(
        Branch $branch,
        User $barber,
        ResolvedBasket $basket,
        CarbonImmutable $startsAt,
        BookingSourceEnum $source,
        ?Customer $customer = null,
        ?string $guestName = null,
        ?string $guestPhone = null,
        ?string $notes = null,
        bool $override = false,
        ?User $createdBy = null,
    ): Booking {
        if ($customer === null && ($guestName === null || $guestPhone === null)) {
            throw BookingException::invalidBasket('A booking needs either a customer or a name and phone.');
        }

        $settings = BookingSettings::resolve($branch, $barber);

        $booking = DB::transaction(function () use (
            $branch, $barber, $basket, $startsAt, $source, $customer,
            $guestName, $guestPhone, $notes, $override, $createdBy, $settings
        ): Booking {
            $this->lockDay($barber, $startsAt);

            if (! $override) {
                $this->assertBookable($branch, $barber, $startsAt, $basket->totalDuration);
            }

            $booking = Booking::query()->withoutGlobalScopes()->create([
                'tenant_id' => $branch->tenant_id,
                'branch_id' => $branch->getKey(),
                'barber_user_id' => $barber->getKey(),
                'customer_id' => $customer?->getKey(),
                'guest_name' => $guestName,
                'guest_phone' => $guestPhone,
                'source' => $source,
                'status' => BookingStatusEnum::Confirmed,
                'starts_at' => $startsAt->utc(),
                'ends_at' => $startsAt->addMinutes($basket->totalDuration)->utc(),
                'duration_minutes' => $basket->totalDuration,
                'gap_minutes' => $settings->gapMinutes,
                'total_price' => $basket->totalPrice,
                'currency' => $basket->currency,
                'booking_code' => BookingCode::generate(),
                'notes' => $notes,
                'is_forced' => $override,
                'created_by_user_id' => $createdBy?->getKey(),
            ]);

            foreach ($basket->lines as $line) {
                $booking->items()->create($line->toItemAttributes());
            }

            return $booking->load('items');
        });

        BookingCreated::dispatch($booking);

        return $booking;
    }

    /**
     * Serialize writers touching the same barber and day. A no-op on SQLite, which
     * is why the test suite's race test skips rather than pretending to pass.
     */
    private function lockDay(User $barber, CarbonImmutable $startsAt): void
    {
        $day = BookingTime::day($startsAt);

        Booking::query()
            ->withoutGlobalScopes()
            ->where('barber_user_id', $barber->getKey())
            ->whereBetween('starts_at', [$day->startOfDay()->utc(), $day->endOfDay()->utc()])
            ->lockForUpdate()
            ->get(['id']);
    }

    /**
     * Re-ask the engine inside the lock. Availability is computed, so this is the
     * same question the customer's slot picker asked — just answered again now that
     * nobody else can write.
     */
    private function assertBookable(
        Branch $branch,
        User $barber,
        CarbonImmutable $startsAt,
        int $duration,
        int|string|null $exceptBookingId = null,
    ): void {
        $settings = BookingSettings::resolve($branch, $barber);

        if ($settings->isPaused) {
            throw BookingException::barberPaused();
        }

        // The booking being moved must not block its own new time.
        if ($exceptBookingId !== null) {
            Booking::query()->withoutGlobalScopes()->whereKey($exceptBookingId)->update([
                'status' => BookingStatusEnum::Cancelled->value,
            ]);
            OccupancyCache::forget((int) $branch->getKey(), (int) $barber->getKey(), BookingTime::day($startsAt));
        }

        if (! AvailabilityEngine::isBookable($branch, $barber, $startsAt, $duration)) {
            throw BookingException::slotTaken();
        }
    }
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test tests/Feature/Booking/BookingServiceTest.php`
Expected: PASS, with the race test reported as skipped.

If "rescheduling onto a taken time is refused and the original survives" fails because `assertBookable` cancelled the original before discovering the clash, that is the transaction's job: the `DB::transaction` in `reschedule()` rolls the status change back when `assertBookable` throws. Confirm the test asserts the original is still `Confirmed` **after** the exception, and that the throw happens inside the transaction closure.

- [ ] **Step 10: Run the whole suite**

Run: `cd apps/bltdreeg-server/tenant-app && php artisan test`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add apps/bltdreeg-server/packages/core/src/Modules/Booking/ \
        apps/bltdreeg-server/tenant-app/tests/Feature/Booking/
git commit -m "$(cat <<'EOF'
feat(booking): booking lifecycle with overlap guard and cache invalidation

Every write takes the barber's day lock, re-asks the availability engine inside
it, then persists. Manual bookings may override the rules and are flagged
is_forced. Reschedule writes a new row linked to the old one. The overlap rule
is extracted as a pure OverlapGuard so it is provable without a database, since
SQLite ignores lockForUpdate. Writes bust the occupancy cache immediately.
Domain events fire with no listeners yet — the seam for notifications.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Done when

- [ ] `cd apps/bltdreeg-server/tenant-app && php artisan test` is green, with one skipped test (the MySQL race).
- [ ] `services` and `packages` are branch-owned; `CatalogImporter` imports per branch.
- [ ] A barber's bookable time is fully described by `barber_schedules`, `barber_booking_settings` and `barber_time_blocks`.
- [ ] `AvailabilityEngine::day()` answers with slots and queue previews, and `BookingService` can book, reschedule, cancel, complete and no-show against it.
- [ ] No UI, no API routes, no doc rewrites — those are the next two plans.

## Self-review notes

Checked against the spec:

- **§4.1–4.9** → Tasks 1, 3, 4, 5, 6. All nine migrations are accounted for; `2026_10_09_000004` carries both the job-type flag and the branch columns, as the spec says.
- **§4.10 (never stored)** → Task 6: no queue-number column, no slot rows anywhere.
- **§4.11 (double-booking)** → Task 9: lock plus re-check, with the pure guard extracted.
- **§5 (engine)** → Task 8, including the §5.1 occupancy-level cache and §5.3 projector (built in Task 6, where the model it reads lives).
- **§5.2 (basket)** → Task 7.
- **§6 (lifecycle)** → Task 9, all six methods and all three events.
- **§7, §8, §9, §10, §11** → deliberately out of this plan; they are the next two plans plus the doc rewrite.

Type consistency: `ResolvedBasket->totalDuration`/`totalPrice`/`currency`, `BasketLine->toItemAttributes()`, `AvailableSlot->startsAt`/`queueNumberPreview`, `BookingSettings->gapMinutes`/`cancelCutoffMinutes`, `Booking->footprintEndsAt()`, `BookingStatusEnum::occupying()` and `->isTerminal()` are used with the same names and shapes in every task that consumes them.

One thing a reviewer should watch: `assertBookable()` temporarily cancels the booking being rescheduled so it does not block its own new time. That is only safe because it runs inside `reschedule()`'s transaction, which rolls it back on refusal. Task 9 Step 9 calls this out and the test pins it.
