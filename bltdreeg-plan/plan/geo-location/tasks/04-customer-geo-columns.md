# 04 · Customers: NOT NULL geo columns, back-fill, creation paths

**Depends on:** 02 · **Decisions:** D4, D5, D9 · **Review Focus:** #2, #5

Root: `apps/bltdreeg-server/`.

**Files:**
- Create: `packages/core/database/migrations/2026_10_06_000003_add_geo_location_to_customers_table.php`
- Modify: `packages/core/src/Modules/Customers/Models/Customer.php` (fillable, casts, relations)
- Modify: `packages/core/src/Modules/Customers/Database/Factories/CustomerFactory.php`
- Modify: `central-app/app/Modules/V1/Customer/Auth/Http/Controllers/OtpController.php` (register purpose, `Customer::create` at ~line 133)
- Modify: `central-app/app/Modules/V1/Customer/Auth/Social/SocialAuthService.php` (`authenticate()`, `Customer::create` at ~line 84)
- Modify: `central-app/app/Modules/V1/Customer/Auth/Http/Controllers/SocialLoginController.php` (pass `$request->ip()`)
- Test: `central-app/tests/Feature/Geo/CustomerGeoColumnsTest.php`, plus the existing `RegistrationTest.php` and `SocialAuthTest.php` (they must stay green)

**Interfaces:**
- Consumes: `LocationResolver::fromIp()`, `::nearest()`, `::fallback()`, `ResolvedLocation::toCustomerColumns()`, `EgyptBounds::contains()`, `LocationSourceEnum` (Task 02)
- Produces:
  - Columns `customers.governorate_id char(4)`, `city_id char(6)`, `area_id char(8)` (NOT NULL FKs) and `customers.location_confirmed_at timestamp NULL`
  - `last_lat`, `last_lng` and `location_source` are now NOT NULL
  - `Customer::governorate(): BelongsTo`, `::city()`, `::area()`
  - Factory states `unconfirmedLocation()`, `inAlexandria()`
  - `SocialAuthService::authenticate(..., ?string $ipAddress = null)`

---

- [ ] **Step 1: Write the failing test**

`central-app/tests/Feature/Geo/CustomerGeoColumnsTest.php`:
```php
<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('factory customers have a full location', function () {
    $customer = Customer::factory()->create();

    expect($customer->area_id)->toBe('EG011103')
        ->and($customer->city->id)->toBe('EG0111')
        ->and($customer->governorate->getTranslation('name', 'en'))->toBe('Cairo')
        ->and($customer->location_confirmed_at)->not->toBeNull();
});

test('area is required at the database level', function () {
    Customer::factory()->create(['area_id' => null]);
})->throws(QueryException::class);

test('unknown area violates the foreign key', function () {
    Customer::factory()->create(['area_id' => 'EG999999']);
})->throws(QueryException::class);

test('registration stores the ip location', function () {
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn(new Coordinates(31.2001, 29.9187));
    app()->instance(IpGeolocator::class, $geolocator);

    $customer = registerCustomerThroughOtp('+201011112222');

    expect($customer->area_id)->toBe('EG020405')
        ->and($customer->location_source)->toBe(LocationSourceEnum::Ip->value)
        ->and($customer->location_confirmed_at)->toBeNull();
});

test('registration with foreign ip stores default area', function () {
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn(new Coordinates(51.5074, -0.1278));
    app()->instance(IpGeolocator::class, $geolocator);

    $customer = registerCustomerThroughOtp('+201011113333');

    expect($customer->area_id)->toBe('EG011103')
        ->and($customer->location_source)->toBe(LocationSourceEnum::Default->value);
});
```

Also add the back-fill test (Review Focus #5). Roll back through this migration, insert legacy rows, then migrate again. Use `--step=2` when Task 06's branch migration already exists, otherwise `--step=1`:
```php
test('migration back-fills legacy customers and confirms only gps/manual ones', function () {
    $this->artisan('migrate:rollback', ['--step' => 2, '--no-interaction' => true])->assertSuccessful();

    $insert = fn (?float $lat, ?float $lng, ?int $source): int => DB::table('customers')->insertGetId([
        'ulid' => (string) Str::ulid(), 'phone' => '+2010'.random_int(10000000, 99999999),
        'last_lat' => $lat, 'last_lng' => $lng, 'location_source' => $source,
        'locale' => 'ar', 'is_active' => true, 'created_at' => now(), 'updated_at' => now(),
    ]);
    $noLocation = $insert(null, null, null);
    $gpsAlexandria = $insert(31.2001, 29.9187, LocationSourceEnum::Gps->value);
    $ipCairo = $insert(30.0444, 31.2357, LocationSourceEnum::Ip->value);

    $this->artisan('migrate', ['--no-interaction' => true])->assertSuccessful();

    $row = fn (int $id) => DB::table('customers')->find($id);
    expect($row($noLocation)->area_id)->toBe('EG011103')
        ->and($row($noLocation)->location_confirmed_at)->toBeNull()
        ->and($row($gpsAlexandria)->area_id)->toBe('EG020405')
        ->and($row($gpsAlexandria)->location_confirmed_at)->not->toBeNull()
        ->and($row($ipCairo)->location_confirmed_at)->toBeNull();
});
```
This needs `use Illuminate\Support\Facades\DB;` and `use Illuminate\Support\Str;`.

Add a helper named `registerCustomerThroughOtp(string $phone): Customer`. Copy the register → OTP-verify happy path from `tests/Feature/CustomerAuth/RegistrationTest.php`, including how that file fakes the OTP code, and return `Customer::query()->where('phone', $phone)->firstOrFail()`. Put the helper in `tests/Pest.php` if `RegistrationTest` already uses a shared helper; otherwise put it at the bottom of this test file.

- [ ] **Step 2: Run it to verify it fails**

Run (in `central-app`): `php artisan test --compact tests/Feature/Geo/CustomerGeoColumnsTest.php`
Expected: FAIL. `area_id` is null, or "no such column: area_id".

- [ ] **Step 3: Migration with back-fill**

`2026_10_06_000003_add_geo_location_to_customers_table.php`:
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
        Schema::table('customers', function (Blueprint $table): void {
            $table->char('governorate_id', 4)->nullable()->after('last_lng');
            $table->char('city_id', 6)->nullable()->after('governorate_id');
            $table->char('area_id', 8)->nullable()->after('city_id');
            $table->timestamp('location_confirmed_at')->nullable()->after('location_updated_at');
        });

        $resolver = app(LocationResolver::class);

        DB::table('customers')->orderBy('id')->chunkById(200, function ($customers) use ($resolver): void {
            foreach ($customers as $customer) {
                $source = LocationSourceEnum::tryFrom((int) $customer->location_source);
                $hasPoint = is_numeric($customer->last_lat) && is_numeric($customer->last_lng)
                    && EgyptBounds::contains((float) $customer->last_lat, (float) $customer->last_lng);

                $location = $hasPoint
                    ? $resolver->nearest((float) $customer->last_lat, (float) $customer->last_lng, $source ?? LocationSourceEnum::Gps)
                    : $resolver->fallback();

                // اللي ادّى موقع GPS أو حطّه بإيده قبل كده ميتسألش تاني
                $alreadyChosen = $hasPoint && in_array($source, [LocationSourceEnum::Gps, LocationSourceEnum::Manual], true);

                DB::table('customers')->where('id', $customer->id)->update([
                    ...$location->toCustomerColumns(),
                    'location_confirmed_at' => $alreadyChosen ? now() : null,
                ]);
            }
        });

        Schema::table('customers', function (Blueprint $table): void {
            $table->char('governorate_id', 4)->nullable(false)->change();
            $table->char('city_id', 6)->nullable(false)->change();
            $table->char('area_id', 8)->nullable(false)->change();
            $table->decimal('last_lat', 10, 7)->nullable(false)->change();
            $table->decimal('last_lng', 10, 7)->nullable(false)->change();
            $table->unsignedTinyInteger('location_source')->nullable(false)->change();

            $table->foreign('governorate_id')->references('id')->on('geo_governorates')->restrictOnDelete();
            $table->foreign('city_id')->references('id')->on('geo_cities')->restrictOnDelete();
            $table->foreign('area_id')->references('id')->on('geo_areas')->restrictOnDelete();
            $table->index(['governorate_id', 'city_id']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->dropForeign(['governorate_id']);
            $table->dropForeign(['city_id']);
            $table->dropForeign(['area_id']);
            $table->dropIndex(['governorate_id', 'city_id']);
            $table->dropColumn(['governorate_id', 'city_id', 'area_id', 'location_confirmed_at']);
            $table->decimal('last_lat', 10, 7)->nullable()->change();
            $table->decimal('last_lng', 10, 7)->nullable()->change();
            $table->unsignedTinyInteger('location_source')->nullable()->change();
        });
    }
};
```
This migration calls the app's `LocationResolver` on purpose. Rows are few, and copying the resolver here would drift from it. If that resolver is ever changed incompatibly, freeze a copy of today's logic in this file.

- [ ] **Step 4: Model + factory**

`Customer.php`:
- Add `'governorate_id', 'city_id', 'area_id', 'location_confirmed_at'` to `#[Fillable]`.
- Add `'location_confirmed_at' => 'datetime'` to `casts()`.
- Add the relations:
```php
public function governorate(): BelongsTo
{
    return $this->belongsTo(GeoGovernorate::class, 'governorate_id');
}

public function city(): BelongsTo
{
    return $this->belongsTo(GeoCity::class, 'city_id');
}

public function area(): BelongsTo
{
    return $this->belongsTo(GeoArea::class, 'area_id');
}
```

`CustomerFactory::definition()`: keep `last_lat`/`last_lng` at `30.0444`/`31.2357` and add:
```php
'governorate_id' => 'EG01',
'city_id' => 'EG0111',
'area_id' => 'EG011103',
'location_confirmed_at' => now(),
```
Then add these states:
```php
public function unconfirmedLocation(): static
{
    return $this->state(fn (array $attributes) => [
        'location_source' => 2, // IP
        'location_confirmed_at' => null,
    ]);
}

public function inAlexandria(): static
{
    return $this->state(fn (array $attributes) => [
        'governorate_id' => 'EG02',
        'city_id' => 'EG0204',
        'area_id' => 'EG020405',
        'last_lat' => 31.2001,
        'last_lng' => 29.9187,
    ]);
}
```

- [ ] **Step 5: Creation paths**

`OtpController`: inject `private LocationResolver $locationResolver` in the constructor, following the existing promoted-property style. In the register branch, resolve **before** the transaction (no network call while holding a row lock):
```php
$location = $this->locationResolver->fromIp($request->ip());

$customer = DB::transaction(function () use ($challenge, $normalizedPhone, $location) {
    // … unchanged checks …
    return Customer::create([
        // … unchanged fields …
        ...$location->toCustomerColumns(),
    ]);
});
```

`SocialAuthService::authenticate()`: add a trailing parameter `?string $ipAddress = null`. Before `DB::transaction(` resolve `$location = $this->locationResolver->fromIp($ipAddress);` (inject `LocationResolver` in the constructor). In the "3. New customer" `Customer::create([...])`, add `...$location->toCustomerColumns(),`. In `SocialLoginController::__invoke`, pass `$request->ip()` as the new argument.

- [ ] **Step 6: Run the new and the touched suites**

Run: `php artisan test --compact tests/Feature/Geo/CustomerGeoColumnsTest.php tests/Feature/CustomerAuth`
Expected: all pass. A failure in existing CustomerAuth tests that create customers with `Customer::create([...])` directly instead of the factory is expected. Fix each by adding `...app(LocationResolver::class)->fallback()->toCustomerColumns()` to that array. Do not delete tests.

- [ ] **Step 7: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add packages/core central-app
git commit -m "feat(customers): required governorate/city/area resolved from ip on signup"
```
