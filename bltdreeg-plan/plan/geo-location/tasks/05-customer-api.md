# 05 · Customer API: geo lookups, resolve, estimate, `/me/location`, onboarding status

**Depends on:** 04 · **Decisions:** D7, D8, D9, D10 · **Review Focus:** #1, #4

Root: `apps/bltdreeg-server/central-app/`.

**Files:**
- Create: `app/Modules/V1/Geo/routes/api.php`. Load it from `GeoServiceProvider::boot()` the same way `CustomerServiceProvider` loads `Customer/Auth/routes/api.php`; copy that call.
- Create: `app/Modules/V1/Geo/Http/Controllers/GeoDivisionsController.php`, `app/Modules/V1/Geo/Http/Controllers/GeoResolveController.php`
- Create: `app/Modules/V1/Geo/Http/Requests/ResolvePointRequest.php`
- Create: `app/Modules/V1/Geo/Http/Resources/GeoDivisionResource.php`, `app/Modules/V1/Geo/Http/Resources/ResolvedLocationResource.php`
- Modify: `app/Modules/V1/Customer/Auth/Http/Controllers/MeLocationController.php` (both methods)
- Modify: `app/Modules/V1/Customer/Auth/Http/Requests/UpdateLocationRequest.php` (rules)
- Modify: `app/Modules/V1/Customer/Auth/Http/Resources/CustomerResource.php` (`location`, `area_name`)
- Modify: `app/Modules/V1/Customer/Auth/Support/OnboardingStatus.php`, `app/Modules/V1/Customer/Auth/Enums/OnboardingStepEnum.php`
- Test: `tests/Feature/Geo/GeoEndpointsTest.php`, `tests/Feature/Geo/MeLocationTest.php`. Update the expectations in `tests/Feature/CustomerAuth/MeEndpointsTest.php` and `tests/Unit/CustomerAuth/OnboardingStatusTest.php` (location is no longer skippable).

**Interfaces:**
- Consumes: Task 01 models + `optionsFor`; Task 02 `LocationResolver`, `ResolvedLocation`, `LocationSourceEnum`, `EgyptBounds`; Task 04 `Customer` relations
- Produces (HTTP, all under `/api/v1`, locale from `SetApiLocale`):
  - `GET geo/governorates` → `{data: [{id, name, lat, lng}]}` sorted by name. The same shape is returned by `GET geo/governorates/{id}/cities` and `GET geo/cities/{id}/areas`. Unknown parent → 404. Header `Cache-Control: max-age=86400, public` plus ETag.
  - `GET geo/resolve?lat&lng` → `{data: ResolvedLocation}`. 422 `location` outside Egypt. Throttle 60/min.
  - `ResolvedLocation` JSON: `{governorate:{id,name}, city:{id,name}, area:{id,name}, lat, lng, source}`
  - `GET me/location/estimate` → `{estimate: ResolvedLocation}`, **never null**: IP, or `source: "default"`
  - `PUT me/location` body `{area_id?, lat?, lng?, source?: gps|ip|manual}`
    - **with `area_id`** = explicit confirm: always saved per D8, sets `location_confirmed_at`
    - **without `area_id`** = automatic: lat/lng (or the IP when absent) saved only if `canBeReplacedAutomaticallyBy`; `source=manual` with lat/lng counts as explicit (saved, but not confirmed)
    - Returns `CustomerResource`
  - `CustomerResource.location` = `{lat, lng, source, updated_at, confirmed, governorate:{id,name}, city:{id,name}, area:{id,name}}`, always present. `area_name` = localized area name.
  - `onboarding.missing` contains `location` until confirmed. `location` never appears in `skippable`.

---

- [ ] **Step 1: Write the failing geo endpoint tests**

`tests/Feature/Geo/GeoEndpointsTest.php`:
```php
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('lists governorates localized and cacheable', function () {
    $response = $this->getJson('/api/v1/geo/governorates', ['Accept-Language' => 'ar']);

    $response->assertOk()
        ->assertJsonCount(27, 'data')
        ->assertJsonFragment(['id' => 'EG01', 'name' => 'القاهرة']);

    expect($response->headers->get('Cache-Control'))->toContain('max-age=86400')->toContain('public');
});

test('lists cities of a governorate and areas of a city', function () {
    $this->getJson('/api/v1/geo/governorates/EG01/cities', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonFragment(['id' => 'EG0111', 'name' => 'Qasr Al-Nile']);

    $this->getJson('/api/v1/geo/cities/EG0111/areas', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonFragment(['id' => 'EG011102', 'name' => 'Garden City']);
});

test('unknown parents return 404', function () {
    $this->getJson('/api/v1/geo/governorates/EG99/cities')->assertNotFound();
    $this->getJson('/api/v1/geo/cities/EG9999/areas')->assertNotFound();
});

test('resolves a point to divisions', function () {
    $this->getJson('/api/v1/geo/resolve?lat=31.2001&lng=29.9187', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.area.id', 'EG020405')
        ->assertJsonPath('data.city.id', 'EG0204')
        ->assertJsonPath('data.governorate.name', 'Alexandria')
        ->assertJsonPath('data.source', 'gps');
});

test('resolve rejects points outside egypt and missing coordinates', function () {
    $this->getJson('/api/v1/geo/resolve?lat=51.5&lng=-0.12')->assertStatus(422)->assertJsonValidationErrors(['location']);
    $this->getJson('/api/v1/geo/resolve?lat=30.0')->assertStatus(422)->assertJsonValidationErrors(['lng']);
});
```

- [ ] **Step 2: Write the failing `/me/location` tests**

`tests/Feature/Geo/MeLocationTest.php`:
```php
<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function ipResolvesTo(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

test('new customer must confirm location before onboarding completes', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();

    $this->actingAs($customer, 'customer')->getJson('/api/v1/me')
        ->assertJsonPath('onboarding.complete', false)
        ->assertJsonPath('onboarding.missing', ['location'])
        ->assertJsonPath('location.confirmed', false)
        ->assertJsonPath('location.area.id', 'EG011103');
});

test('estimate returns the ip location, or the default when ip is foreign', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();
    $this->actingAs($customer, 'customer');

    ipResolvesTo(new Coordinates(31.2001, 29.9187));
    $this->getJson('/api/v1/me/location/estimate')
        ->assertOk()->assertJsonPath('estimate.area.id', 'EG020405')->assertJsonPath('estimate.source', 'ip');

    ipResolvesTo(new Coordinates(51.5074, -0.1278));
    $this->getJson('/api/v1/me/location/estimate')
        ->assertOk()->assertJsonPath('estimate.area.id', 'EG011103')->assertJsonPath('estimate.source', 'default');
});

test('confirming with area and same-city gps keeps the gps point', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['area_id' => 'EG011102', 'lat' => 30.0444, 'lng' => 31.2357, 'source' => 'gps'])
        ->assertOk()
        ->assertJsonPath('location.area.id', 'EG011102')
        ->assertJsonPath('location.city.id', 'EG0111')
        ->assertJsonPath('location.lat', 30.0444)
        ->assertJsonPath('location.source', 'gps')
        ->assertJsonPath('location.confirmed', true)
        ->assertJsonPath('onboarding.complete', true);
});

test('confirming an area in another city replaces the point with its centroid', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();
    $area = GeoArea::query()->findOrFail('EG020405');

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['area_id' => 'EG020405', 'lat' => 30.0444, 'lng' => 31.2357, 'source' => 'ip'])
        ->assertOk()
        ->assertJsonPath('location.governorate.id', 'EG02')
        ->assertJsonPath('location.lat', $area->lat)
        ->assertJsonPath('location.source', 'manual');
});

test('unknown area is rejected', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create();

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['area_id' => 'EG999999'])
        ->assertStatus(422)->assertJsonValidationErrors(['area_id']);
});

test('automatic ip refresh never replaces a confirmed manual location', function () {
    $customer = Customer::factory()->inAlexandria()->create(['location_source' => LocationSourceEnum::Manual->value]);
    ipResolvesTo(new Coordinates(30.0444, 31.2357));

    $this->actingAs($customer, 'customer')->putJson('/api/v1/me/location', [])
        ->assertOk()->assertJsonPath('location.area.id', 'EG020405')->assertJsonPath('location.source', 'manual');
});

test('automatic gps refresh updates gps but not manual', function () {
    $gpsCustomer = Customer::factory()->create();
    $this->actingAs($gpsCustomer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 31.2001, 'lng' => 29.9187, 'source' => 'gps'])
        ->assertJsonPath('location.area.id', 'EG020405');

    $manualCustomer = Customer::factory()->create(['location_source' => LocationSourceEnum::Manual->value]);
    $this->actingAs($manualCustomer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 31.2001, 'lng' => 29.9187, 'source' => 'gps'])
        ->assertJsonPath('location.area.id', 'EG011103');
});

test('ip refresh upgrades a default location', function () {
    $customer = Customer::factory()->unconfirmedLocation()->create(['location_source' => LocationSourceEnum::Default->value]);
    ipResolvesTo(new Coordinates(31.2001, 29.9187));

    $this->actingAs($customer, 'customer')->putJson('/api/v1/me/location', [])
        ->assertJsonPath('location.area.id', 'EG020405')->assertJsonPath('location.source', 'ip')
        ->assertJsonPath('location.confirmed', false);
});
```

- [ ] **Step 3: Run both to verify they fail**

Run: `php artisan test --compact tests/Feature/Geo/GeoEndpointsTest.php tests/Feature/Geo/MeLocationTest.php`
Expected: FAIL. The geo routes return 404, and `location.area` is missing.

- [ ] **Step 4: Geo resources, request, controllers, routes**

`app/Modules/V1/Geo/Http/Resources/GeoDivisionResource.php`:
```php
<?php

namespace App\Modules\V1\Geo\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read \Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate|\Bltdreeg\Core\Modules\Geo\Models\GeoCity|\Bltdreeg\Core\Modules\Geo\Models\GeoArea $resource
 */
class GeoDivisionResource extends JsonResource
{
    /**
     * @return array{id: string, name: string, lat: float, lng: float}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->getTranslation('name', app()->getLocale()),
            'lat' => $this->resource->lat,
            'lng' => $this->resource->lng,
        ];
    }
}
```

`app/Modules/V1/Geo/Http/Resources/ResolvedLocationResource.php`:
```php
<?php

namespace App\Modules\V1\Geo\Http\Resources;

use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ResolvedLocation $resource
 */
class ResolvedLocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $area = $this->resource->area->loadMissing(['city', 'governorate']);
        $locale = app()->getLocale();

        return [
            'governorate' => ['id' => $area->governorate->id, 'name' => $area->governorate->getTranslation('name', $locale)],
            'city' => ['id' => $area->city->id, 'name' => $area->city->getTranslation('name', $locale)],
            'area' => ['id' => $area->id, 'name' => $area->getTranslation('name', $locale)],
            'lat' => $this->resource->lat,
            'lng' => $this->resource->lng,
            'source' => $this->resource->source->label(),
        ];
    }
}
```

`app/Modules/V1/Geo/Http/Requests/ResolvePointRequest.php`:
```php
<?php

namespace App\Modules\V1\Geo\Http\Requests;

use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ResolvePointRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if (! EgyptBounds::contains((float) $this->input('lat'), (float) $this->input('lng'))) {
                $validator->errors()->add('location', __('Coordinates must be within Egypt.'));
            }
        });
    }
}
```

`GeoDivisionsController.php`:
```php
<?php

namespace App\Modules\V1\Geo\Http\Controllers;

use App\Modules\V1\Geo\Http\Resources\GeoDivisionResource;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

class GeoDivisionsController extends Controller
{
    public function governorates(): AnonymousResourceCollection
    {
        return $this->sorted(GeoGovernorate::query()->get());
    }

    public function cities(GeoGovernorate $governorate): AnonymousResourceCollection
    {
        return $this->sorted($governorate->cities()->get());
    }

    public function areas(GeoCity $city): AnonymousResourceCollection
    {
        return $this->sorted($city->areas()->get());
    }

    private function sorted(Collection $divisions): AnonymousResourceCollection
    {
        $locale = app()->getLocale();

        return GeoDivisionResource::collection(
            $divisions->sortBy(fn (GeoGovernorate|GeoCity|GeoArea $division): string => $division->getTranslation('name', $locale))->values()
        );
    }
}
```

`GeoResolveController.php`:
```php
<?php

namespace App\Modules\V1\Geo\Http\Controllers;

use App\Modules\V1\Geo\Http\Requests\ResolvePointRequest;
use App\Modules\V1\Geo\Http\Resources\ResolvedLocationResource;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Illuminate\Routing\Controller;

class GeoResolveController extends Controller
{
    public function __invoke(ResolvePointRequest $request, LocationResolver $resolver): ResolvedLocationResource
    {
        return new ResolvedLocationResource(
            $resolver->nearest((float) $request->input('lat'), (float) $request->input('lng'), LocationSourceEnum::Gps)
        );
    }
}
```

`app/Modules/V1/Geo/routes/api.php`:
```php
<?php

use App\Modules\V1\Customer\Auth\Http\Middleware\SetApiLocale;
use App\Modules\V1\Geo\Http\Controllers\GeoDivisionsController;
use App\Modules\V1\Geo\Http\Controllers\GeoResolveController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/geo')
    ->middleware([SetApiLocale::class])
    ->group(function () {
        Route::middleware('cache.headers:public;max_age=86400;etag')->group(function () {
            Route::get('governorates', [GeoDivisionsController::class, 'governorates']);
            Route::get('governorates/{governorate}/cities', [GeoDivisionsController::class, 'cities']);
            Route::get('cities/{city}/areas', [GeoDivisionsController::class, 'areas']);
        });

        Route::get('resolve', GeoResolveController::class)->middleware('throttle:60,1');
    });
```
Route-model binding on the string PKs resolves `{governorate}` → `GeoGovernorate` and `{city}` → `GeoCity` by `id` (404 when missing). If the `Accept-Language` header isn't what `SetApiLocale` reads, copy the header or param that `MeEndpointsTest` uses for locale into these tests.

- [ ] **Step 5: `/me/location` request + controller**

`UpdateLocationRequest::rules()`:
```php
return [
    'lat' => ['nullable', 'numeric'],
    'lng' => ['nullable', 'numeric'],
    'source' => ['nullable', 'in:gps,ip,manual'],
    'area_id' => ['nullable', 'string', 'exists:geo_areas,id'],
];
```
Keep the existing `withValidator` (both-or-neither, inside Egypt via `inEgypt`).

`MeLocationController` (replace both methods):
```php
public function update(UpdateLocationRequest $request, LocationResolver $resolver): CustomerResource
{
    /** @var Customer $customer */
    $customer = $request->user();

    $current = LocationSourceEnum::tryFrom((int) $customer->location_source) ?? LocationSourceEnum::Default;
    $lat = $request->filled('lat') ? (float) $request->input('lat') : null;
    $lng = $request->filled('lng') ? (float) $request->input('lng') : null;
    $source = LocationSourceEnum::tryFromLabel($request->input('source')) ?? LocationSourceEnum::Gps;

    if ($request->filled('area_id')) {
        // تأكيد صريح من العميل — دايماً بيكسب، وبيقفل خطوة الـ onboarding
        $location = $resolver->forArea((string) $request->input('area_id'), $lat, $lng, $source);
        $customer->forceFill([...$location->toCustomerColumns(), 'location_confirmed_at' => now()])->save();
    } elseif ($lat !== null && $lng !== null) {
        $location = $resolver->nearest($lat, $lng, $source);

        if ($source === LocationSourceEnum::Manual || $current->canBeReplacedAutomaticallyBy($source)) {
            $customer->forceFill($location->toCustomerColumns())->save();
        }
    } else {
        $location = $resolver->fromIp($request->ip());

        if ($location->source === LocationSourceEnum::Ip && $current->canBeReplacedAutomaticallyBy(LocationSourceEnum::Ip)) {
            $customer->forceFill($location->toCustomerColumns())->save();
        }
    }

    return new CustomerResource($customer->fresh(['governorate', 'city', 'area']));
}

/**
 * Read-only estimate used to pre-fill the onboarding dropdowns. Never writes, never null.
 */
public function estimate(Request $request, LocationResolver $resolver): JsonResponse
{
    return response()->json([
        'estimate' => (new ResolvedLocationResource($resolver->fromIp($request->ip())))->resolve($request),
    ]);
}
```
Replace the `IpGeolocator` import with `LocationResolver`, `LocationSourceEnum` (core) and `ResolvedLocationResource`.

- [ ] **Step 6: CustomerResource + onboarding status**

In `CustomerResource::toArray()`, replace the `$location` block:
```php
$this->resource->loadMissing(['governorate', 'city', 'area']);
$locale = app()->getLocale();

$location = [
    'lat' => (float) $this->resource->last_lat,
    'lng' => (float) $this->resource->last_lng,
    'source' => LocationSourceEnum::tryFrom((int) $this->resource->location_source)?->label(),
    'updated_at' => $this->resource->location_updated_at?->toISOString(),
    'confirmed' => $this->resource->location_confirmed_at !== null,
    'governorate' => ['id' => $this->resource->governorate->id, 'name' => $this->resource->governorate->getTranslation('name', $locale)],
    'city' => ['id' => $this->resource->city->id, 'name' => $this->resource->city->getTranslation('name', $locale)],
    'area' => ['id' => $this->resource->area->id, 'name' => $this->resource->area->getTranslation('name', $locale)],
];
```
and set `'area_name' => $this->resource->area->getTranslation('name', $locale),`.

`OnboardingStatus::for()`: replace block 4 with
```php
// 4. Location (Required) — always pre-filled; the customer only has to confirm it
if ($customer->location_confirmed_at === null) {
    $missing[] = 'location';
}
```
`OnboardingStepEnum::isRequired()`: move `self::Location` into the `true` arm.

Update the existing expectations that list `location` as skippable or expect `location: null`:
```bash
grep -rn "skippable\|'location' => null\|location', null" tests/Feature/CustomerAuth tests/Unit/CustomerAuth
```
Change only the assertions, never delete a test. A test that builds a customer without a confirmed location now expects `location` in `missing`.

- [ ] **Step 7: Run the geo tests and the whole CustomerAuth folder**

Run: `php artisan test --compact tests/Feature/Geo tests/Feature/CustomerAuth tests/Unit`
Expected: all pass. Check that the new endpoints show up in Scramble at `/docs/api` (Geo group, plus `/me/location` with `area_id`).

- [ ] **Step 8: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Modules/V1/Geo app/Modules/V1/Customer tests
git commit -m "feat(customer-api): geo lookups, point resolve and area-confirmed customer location"
```
