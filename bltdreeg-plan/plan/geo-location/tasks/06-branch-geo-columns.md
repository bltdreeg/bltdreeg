# 06 · Branches: NOT NULL geo columns, decimal lat/lng, back-fill

**Depends on:** 02 · **Decisions:** D4, D5 · **Review Focus:** #5

Root: `apps/bltdreeg-server/`.

**Files:**
- Create: `packages/core/database/migrations/2026_10_06_000004_add_geo_location_to_branches_table.php`
- Modify: `packages/core/src/Modules/Tenancy/Models/Branch.php` (fillable, casts, relations)
- Modify: `packages/core/src/Modules/Tenancy/Database/Factories/BranchFactory.php`
- Modify: `packages/core/src/Modules/Tenancy/Support/DemoData.php` (`Branch::query()->create` at ~line 103)
- Test: `tenant-app/tests/Feature/BranchGeoColumnsTest.php`. The existing `tenant-app/tests/Feature/DatabaseSeederTest.php` must stay green.

**Interfaces:**
- Consumes: `LocationResolver::nearest()`, `::fallback()`, `ResolvedLocation::toBranchColumns()`, `EgyptBounds`, `LocationSourceEnum` (Task 02)
- Produces:
  - `branches.governorate_id char(4)`, `city_id char(6)`, `area_id char(8)` (NOT NULL FKs)
  - `branches.latitude`, `longitude` as `decimal(10,7)` NOT NULL
  - `branches.location_source tinyint` NOT NULL
  - `Branch::governorate()`, `::city()`, `::area()`. Lat/lng cast to `float`.

---

- [ ] **Step 1: Find code that relies on the old string/decimal:8 casts**

```bash
grep -rn "latitude\|longitude" --include=*.php tenant-app/app central-app/app packages/core/src tenant-app/tests central-app/tests | grep -v "Geo/"
```
Note every comparison against a string such as `'30.0444000'`. Those assertions change to floats in Step 6.

- [ ] **Step 2: Write the failing test**

`tenant-app/tests/Feature/BranchGeoColumnsTest.php`:
```php
<?php

declare(strict_types=1);

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('factory branches have a full location with float coordinates', function () {
    $branch = Branch::factory()->create();

    expect($branch->area_id)->toBe('EG011103')
        ->and($branch->city->id)->toBe('EG0111')
        ->and($branch->governorate->id)->toBe('EG01')
        ->and($branch->latitude)->toBeFloat()
        ->and($branch->location_source)->toBe(LocationSourceEnum::Manual->value);
});

test('branch area is required', function () {
    Branch::factory()->create(['area_id' => null]);
})->throws(QueryException::class);

test('demo data branches get the default location', function () {
    $this->seed();

    Branch::query()->withoutGlobalScopes()->get()->each(function (Branch $branch): void {
        expect($branch->area_id)->not->toBeNull()
            ->and($branch->latitude)->not->toBeNull();
    });
});
```
Also add the back-fill test (Review Focus #5). It rolls back only this migration, inserts legacy rows, and migrates again:
```php
test('migration back-fills legacy branches with blank, junk and real coordinates', function () {
    $tenant = \Bltdreeg\Core\Modules\Tenancy\Models\Tenant::factory()->create();
    $this->artisan('migrate:rollback', ['--step' => 1, '--no-interaction' => true])->assertSuccessful();

    $insert = fn (?string $lat, ?string $lng): int => DB::table('branches')->insertGetId([
        'tenant_id' => $tenant->getKey(), 'name' => json_encode(['en' => 'Legacy']), 'latitude' => $lat, 'longitude' => $lng,
        'is_active' => true, 'created_at' => now(), 'updated_at' => now(),
    ]);
    $blank = $insert('', '');
    $junk = $insert('abc', null);
    $alexandria = $insert('31.2001', '29.9187');

    $this->artisan('migrate', ['--no-interaction' => true])->assertSuccessful();

    expect(DB::table('branches')->find($blank)->area_id)->toBe('EG011103')
        ->and(DB::table('branches')->find($junk)->area_id)->toBe('EG011103')
        ->and(DB::table('branches')->find($alexandria)->area_id)->toBe('EG020405');
});
```
This needs `use Illuminate\Support\Facades\DB;`. If the latest migration at execution time isn't `2026_10_06_000004`, raise `--step` to reach it.

If `$this->seed()` needs the setup that `DatabaseSeederTest.php` does first (tenant context, roles), copy that setup.

- [ ] **Step 3: Run it to verify it fails**

Run (in `tenant-app`): `php artisan test --compact tests/Feature/BranchGeoColumnsTest.php`
Expected: FAIL. `area_id` is null, or "no such column: area_id".

- [ ] **Step 4: Migration with back-fill**

`2026_10_06_000004_add_geo_location_to_branches_table.php`:
```php
<?php

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->char('governorate_id', 4)->nullable()->after('longitude');
            $table->char('city_id', 6)->nullable()->after('governorate_id');
            $table->char('area_id', 8)->nullable()->after('city_id');
            $table->unsignedTinyInteger('location_source')->nullable()->after('area_id');
        });

        $resolver = app(LocationResolver::class);

        DB::table('branches')->orderBy('id')->chunkById(200, function ($branches) use ($resolver): void {
            foreach ($branches as $branch) {
                // القيم القديمة نصوص ممكن تكون '' أو كلام مش أرقام
                $hasPoint = is_numeric($branch->latitude) && is_numeric($branch->longitude)
                    && EgyptBounds::contains((float) $branch->latitude, (float) $branch->longitude);

                $location = $hasPoint
                    ? $resolver->nearest((float) $branch->latitude, (float) $branch->longitude, LocationSourceEnum::Manual)
                    : $resolver->fallback();

                DB::table('branches')->where('id', $branch->id)->update($location->toBranchColumns());
            }
        });

        Schema::table('branches', function (Blueprint $table): void {
            $table->decimal('latitude', 10, 7)->nullable(false)->change();
            $table->decimal('longitude', 10, 7)->nullable(false)->change();
            $table->char('governorate_id', 4)->nullable(false)->change();
            $table->char('city_id', 6)->nullable(false)->change();
            $table->char('area_id', 8)->nullable(false)->change();
            $table->unsignedTinyInteger('location_source')->nullable(false)->change();

            $table->foreign('governorate_id')->references('id')->on('geo_governorates')->restrictOnDelete();
            $table->foreign('city_id')->references('id')->on('geo_cities')->restrictOnDelete();
            $table->foreign('area_id')->references('id')->on('geo_areas')->restrictOnDelete();
            $table->index(['governorate_id', 'city_id']);
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->dropForeign(['governorate_id']);
            $table->dropForeign(['city_id']);
            $table->dropForeign(['area_id']);
            $table->dropIndex(['governorate_id', 'city_id']);
            $table->dropColumn(['governorate_id', 'city_id', 'area_id', 'location_source']);
            $table->string('latitude')->nullable()->change();
            $table->string('longitude')->nullable()->change();
        });
    }
};
```

- [ ] **Step 5: Model, factory, demo data**

`Branch.php`:
- Add `'governorate_id', 'city_id', 'area_id', 'location_source'` to `#[Fillable]`.
- In `casts()`, change `'latitude' => 'float', 'longitude' => 'float'` and add `'location_source' => 'integer'`.
- Add the three `BelongsTo` relations (`GeoGovernorate`, `GeoCity`, `GeoArea`; FK names as in Task 04).

`BranchFactory::definition()`: replace the `latitude`/`longitude` faker lines (they produce points all over the world) with:
```php
'latitude' => 30.0444,
'longitude' => 31.2357,
'governorate_id' => 'EG01',
'city_id' => 'EG0111',
'area_id' => 'EG011103',
'location_source' => 3, // Manual
```

`DemoData` `Branch::query()->create([...])`: add `...app(LocationResolver::class)->fallback()->withSource(LocationSourceEnum::Manual)->toBranchColumns(),`.

- [ ] **Step 6: Run the new test and the whole tenant suite folder that touches branches**

Run (in `tenant-app`): `php artisan test --compact tests/Feature/BranchGeoColumnsTest.php tests/Feature/DatabaseSeederTest.php tests/Feature/MultiTenancyTest.php tests/Feature/BranchLoginTest.php`
Then (in `central-app`): `php artisan test --compact --filter=Branch`
Expected: all pass. Fix any `Branch::create([...])` in tests that lacks geo columns by switching it to the factory, or by adding the fallback columns. Fix string lat/lng assertions noted in Step 1 to floats.

- [ ] **Step 7: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add packages/core tenant-app/tests central-app/tests
git commit -m "feat(branches): required governorate/city/area and decimal coordinates"
```
