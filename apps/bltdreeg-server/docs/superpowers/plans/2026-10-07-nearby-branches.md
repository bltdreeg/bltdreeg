# Nearby Branches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show every visitor of the customer website a paginated list of salon branches ordered by distance. The list starts from the visitor's IP location. It switches to the precise browser location as soon as the visitor allows location access.

**Architecture:**
- **Central API endpoint.** A new public endpoint, `GET /api/v1/branches/nearby`, lives in the central app. It takes optional `lat`/`lng`. With them it uses the given point. Without them, or when the point is outside Egypt, it uses `LocationResolver::fromIp()`. It orders active branches of approved tenants by `ST_Distance_Sphere` and returns a Laravel paginator. The origin it used is returned in `meta.origin`, so the UI can say "near المعادي".
- **Web home page.** On load, `apps/web` asks the browser for the position and fetches the IP-based list at the same time. When the position arrives, either right away or after the visitor allows it later, the query key changes and the list refetches with coordinates. The old list stays on screen until the new one arrives.

**Tech Stack:** Laravel 12 + Pest (central app, SQLite in tests with emulated MySQL spatial functions); Next.js 16, React Query 5, next-intl, axios (`apps/web`).

**Spec:** No separate spec. The source is the user's request of 2026-10-07: "make an end point for the central to get the salon branches paginated. Any user who visits the website should be asked for location permission. If the user didn't give permission yet, display the nearest branches based on the IP location. After the user allows location, the displayed branches should be updated."

## Global Constraints

- Web data access must follow `apps/web/AGENTS.md`: Component → React Query hook → plain async action → `apiClient` → Laravel. No `"use server"`, no `src/app/api/*` route handlers, no data loading in `useEffect`.
- Laravel responses are `snake_case`. Web types are camelCase, and actions map between them.
- The endpoint is public: no auth and no customer token required. It is throttled at `60` requests per minute per IP.
- Coordinates outside Egypt (`EgyptBounds::contains`) are never used as the origin. The endpoint falls back to IP and then to `config('geo.default_area_id')`. It never errors because of a foreign or VPN location.
- `per_page`: default `12`, maximum `48`.
- Distance in the response is `distance_km`, rounded to 1 decimal.
- The web app sends coordinates rounded to 3 decimals (about 100 m). This keeps query keys stable and avoids sending a more precise location than the feature needs.
- Run PHP tests with `C:/programs/php-8.4.5/php.exe` (PHP 8.2 cannot run the suite).
- The branch `feat/geo-location` has many unrelated uncommitted changes. Every commit must `git add` only the files listed in its task.
- Code comments follow the repo style: short Egyptian-Arabic comments explaining *why*.

## Review Focus

1. **Visitor ignores the permission prompt forever.** The IP-based list must still show; it must not wait on the prompt. *Pinned in Task 4 (`settled` is true while permission is `prompt`).*
2. **Visitor whose browser already granted permission on an earlier visit.** The page must not fetch the IP list first and then the GPS list a moment later. It waits for the position and makes one request. *Pinned in Task 4 (`settled` false while `granted` and position pending).*
3. **Visitor allows location after dismissing the prompt, through the browser site settings.** The list must update without a reload. *Pinned in Task 4 (the permission `change` listener refetches).*
4. **Visitor on a VPN or abroad (IP or GPS outside Egypt).** They still get a list, centered on the default area. *Pinned in Task 1 tests "coordinates outside egypt fall back to ip" and "unknown ip falls back to the default area".*
5. **A branch whose tenant is not approved or is inactive, or an inactive branch.** It must never appear publicly. *Pinned in Task 1 test "only lists active branches of approved active tenants".*

---

## File Structure

**Central app (`apps/bltdreeg-server`)**

| File | Responsibility |
|---|---|
| `central-app/app/Modules/V1/Branches/routes/api.php` (create) | The public `branches/nearby` route |
| `central-app/app/Modules/V1/Branches/BranchesServiceProvider.php` (modify) | Load the routes file |
| `central-app/app/Modules/V1/Branches/Http/Requests/NearbyBranchesRequest.php` (create) | Validate `lat`, `lng`, `page`, `per_page` |
| `central-app/app/Modules/V1/Branches/Http/Controllers/NearbyBranchesController.php` (create) | Pick the origin, run the query, return the paginated resource |
| `central-app/app/Modules/V1/Branches/Http/Resources/NearbyBranchResource.php` (create) | Public JSON shape of one branch |
| `packages/core/src/Modules/Tenancy/Models/Branch.php` (modify) | `scopePubliclyListed()` and `scopeNearestTo()` |
| `central-app/tests/Feature/Branches/NearbyBranchesTest.php` (create) | Endpoint tests |

**Web (`apps/web`)**

| File | Responsibility |
|---|---|
| `src/lib/types/paginated.interface.ts` (replace the TODO stub) | `Paginated<T>` |
| `src/lib/types/branch/nearby-branch.interface.ts` + `index.ts` (create) | `NearbyBranch`, `NearbyBranchesPage` |
| `src/lib/utils/branches/branch-mapper.ts` + `.test.ts` (create) | Laravel → camelCase mapping |
| `src/lib/utils/location/query-position.ts` + `.test.ts` (create) | Round coordinates and reject points outside Egypt |
| `src/lib/actions/branches/branches.action.ts` (create) | `getNearbyBranches()` |
| `src/lib/data/constants/query-keys.constants.ts` (modify) | `QK_VISITOR_POSITION`, `QK_NEARBY_BRANCHES` |
| `src/lib/hooks/geo/use-visitor-position.hook.ts` (create) | Ask for the position, track the permission, and decide when the list can load |
| `src/lib/hooks/branches/use-nearby-branches.hook.ts` + `index.ts` (create) | Infinite query over the endpoint |
| `src/components/molecules/branch-card/branch-card.tsx` + `index.ts` (create) | One branch card |
| `src/app/[locale]/(marketing)/__components/nearby-branches/nearby-branches.tsx` + `index.ts` (create) | Home section: header, grid, "load more", "use my location" |
| `src/app/[locale]/(marketing)/page.tsx` (modify) | Render the section under the hero |
| `src/i18n/messages/ar.json`, `en.json` (modify) | Section strings |

---

### Task 1: Central endpoint `GET /api/v1/branches/nearby`

**Files:**
- Create: `central-app/app/Modules/V1/Branches/routes/api.php`
- Create: `central-app/app/Modules/V1/Branches/Http/Requests/NearbyBranchesRequest.php`
- Create: `central-app/app/Modules/V1/Branches/Http/Controllers/NearbyBranchesController.php`
- Create: `central-app/app/Modules/V1/Branches/Http/Resources/NearbyBranchResource.php`
- Modify: `central-app/app/Modules/V1/Branches/BranchesServiceProvider.php`
- Modify: `packages/core/src/Modules/Tenancy/Models/Branch.php`
- Test: `central-app/tests/Feature/Branches/NearbyBranchesTest.php`

**Interfaces:**
- Consumes: `LocationResolver::nearest(float $lat, float $lng, LocationSourceEnum $source): ResolvedLocation`, `LocationResolver::fromIp(?string $ip): ResolvedLocation`, `ResolvedLocationResource`, `EgyptBounds::contains(float, float): bool`.
- Produces: the HTTP contract that Task 2 relies on:

```
GET /api/v1/branches/nearby?lat=30.044&lng=31.236&page=1&per_page=12
Accept-Language: ar|en

200 {
  "data": [{
    "id": 7,
    "name": "فرع المعادي",
    "address": "...",            // nullable
    "salon": { "id": 3, "name": "Salon X" },
    "area": { "id": "EG011103", "name": "..." },
    "city": { "id": "EG0111", "name": "..." },
    "lat": 30.0444, "lng": 31.2357,
    "distance_km": 1.4,
    "cover_image_url": "https://..." | null,
    "maps_url": "https://..." | null
  }],
  "links": {...},
  "meta": {
    "current_page": 1, "last_page": 3, "per_page": 12, "total": 30, ...,
    "origin": { "governorate": {id,name}, "city": {id,name}, "area": {id,name}, "lat": 30.044, "lng": 31.236, "source": "gps"|"ip"|"default" }
  }
}
422 when only one of lat/lng is sent, or per_page > 48
```

- [ ] **Step 1: Write the failing tests**

`central-app/tests/Feature/Branches/NearbyBranchesTest.php`:

```php
<?php

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function nearbyIpResolvesTo(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

function cairoBranch(array $attributes = []): Branch
{
    return Branch::factory()->create($attributes); // الـ factory في القاهرة (EG011103)
}

function alexandriaBranch(array $attributes = []): Branch
{
    return Branch::factory()->create([
        'latitude' => 31.2001,
        'longitude' => 29.9187,
        'governorate_id' => 'EG02',
        'city_id' => 'EG0204',
        'area_id' => 'EG020405',
        ...$attributes,
    ]);
}

test('orders branches by distance from the given coordinates', function () {
    $cairo = cairoBranch();
    $alexandria = alexandriaBranch();

    $this->getJson('/api/v1/branches/nearby?lat=31.2001&lng=29.9187', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.0.id', $alexandria->id)
        ->assertJsonPath('data.0.distance_km', 0)
        ->assertJsonPath('data.1.id', $cairo->id)
        ->assertJsonPath('meta.origin.source', 'gps')
        ->assertJsonPath('meta.origin.area.id', 'EG020405');
});

test('without coordinates the origin comes from the ip', function () {
    nearbyIpResolvesTo(new Coordinates(lat: 30.0444, lng: 31.2357));
    $cairo = cairoBranch();
    alexandriaBranch();

    $this->getJson('/api/v1/branches/nearby')
        ->assertOk()
        ->assertJsonPath('data.0.id', $cairo->id)
        ->assertJsonPath('meta.origin.source', 'ip');
});

test('coordinates outside egypt fall back to ip', function () {
    nearbyIpResolvesTo(new Coordinates(lat: 31.2001, lng: 29.9187));
    cairoBranch();
    $alexandria = alexandriaBranch();

    $this->getJson('/api/v1/branches/nearby?lat=51.5&lng=-0.12')
        ->assertOk()
        ->assertJsonPath('data.0.id', $alexandria->id)
        ->assertJsonPath('meta.origin.source', 'ip');
});

test('unknown ip falls back to the default area', function () {
    nearbyIpResolvesTo(null);
    cairoBranch();

    $this->getJson('/api/v1/branches/nearby')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.origin.source', 'default');
});

test('only lists active branches of approved active tenants', function () {
    $visible = cairoBranch();
    cairoBranch(['is_active' => false]);
    cairoBranch(['tenant_id' => Tenant::factory()->draft()]);
    cairoBranch(['tenant_id' => Tenant::factory()->state(['is_active' => false])]);

    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $visible->id);
});

test('paginates with per_page', function () {
    cairoBranch();
    cairoBranch(['latitude' => 30.06, 'longitude' => 31.25]);
    $farthest = alexandriaBranch();

    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357&per_page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('meta.total', 3);

    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357&per_page=2&page=2')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $farthest->id);
});

test('localizes branch, area and city names', function () {
    cairoBranch(['name' => ['en' => 'Maadi', 'ar' => 'فرع المعادي']]);

    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357', ['Accept-Language' => 'ar'])
        ->assertJsonPath('data.0.name', 'فرع المعادي');
    $this->getJson('/api/v1/branches/nearby?lat=30.0444&lng=31.2357', ['Accept-Language' => 'en'])
        ->assertJsonPath('data.0.name', 'Maadi')
        ->assertJsonPath('data.0.city.name', 'Qasr Al-Nile');
});

test('rejects half coordinates and oversized pages', function () {
    $this->getJson('/api/v1/branches/nearby?lat=30.0')->assertStatus(422)->assertJsonValidationErrors(['lng']);
    $this->getJson('/api/v1/branches/nearby?per_page=100')->assertStatus(422)->assertJsonValidationErrors(['per_page']);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/bltdreeg-server/central-app && C:/programs/php-8.4.5/php.exe artisan test --filter=NearbyBranchesTest`
Expected: FAIL. Every test gets 404 because the route doesn't exist.

- [ ] **Step 3: Add the Branch scopes**

In `packages/core/src/Modules/Tenancy/Models/Branch.php`, add the imports `Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum` (check the namespace with `grep -rn "enum TenantStatusEnum" packages/core/src`) and `Illuminate\Database\Eloquent\Builder`, then these methods:

```php
    /**
     * الفروع اللي تظهر للعملاء على الموقع: الفرع شغال والصالون متوافق عليه وشغال.
     * من غير scopes التينانت/الفرع: الـ API العام مالوش tenant context.
     */
    public function scopePubliclyListed(Builder $query): Builder
    {
        return $query->withoutGlobalScopes(['tenant', 'branch'])
            ->where('branches.is_active', true)
            ->whereHas('tenant', fn (Builder $tenant) => $tenant
                ->where('status', TenantStatusEnum::APPROVED)
                ->where('is_active', true));
    }

    /**
     * يرتّب بالأقرب ويضيف distance_m (بالمتر). MySQL POINT بياخد (lng, lat).
     */
    public function scopeNearestTo(Builder $query, float $lat, float $lng): Builder
    {
        return $query->select('branches.*')
            ->selectRaw('ST_Distance_Sphere(POINT(branches.longitude, branches.latitude), POINT(?, ?)) AS distance_m', [$lng, $lat])
            ->orderBy('distance_m')
            ->orderBy('branches.id');
    }
```

- [ ] **Step 4: Add the request**

`central-app/app/Modules/V1/Branches/Http/Requests/NearbyBranchesRequest.php`:

```php
<?php

namespace App\Modules\V1\Branches\Http\Requests;

use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Illuminate\Foundation\Http\FormRequest;

class NearbyBranchesRequest extends FormRequest
{
    public const PER_PAGE = 12;

    public const MAX_PER_PAGE = 48;

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
            'lat' => ['nullable', 'numeric', 'between:-90,90', 'required_with:lng'],
            'lng' => ['nullable', 'numeric', 'between:-180,180', 'required_with:lat'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
    }

    /**
     * النقطة بس لو جوه مصر؛ برا مصر (VPN/سفر) بنرجع للـ IP بدل ما نرفض الطلب.
     *
     * @return array{float, float}|null
     */
    public function point(): ?array
    {
        if (! $this->filled('lat') || ! $this->filled('lng')) {
            return null;
        }

        $lat = (float) $this->input('lat');
        $lng = (float) $this->input('lng');

        return EgyptBounds::contains($lat, $lng) ? [$lat, $lng] : null;
    }

    public function perPage(): int
    {
        return (int) ($this->input('per_page') ?? self::PER_PAGE);
    }
}
```

- [ ] **Step 5: Add the resource**

`central-app/app/Modules/V1/Branches/Http/Resources/NearbyBranchResource.php`:

```php
<?php

namespace App\Modules\V1\Branches\Http\Resources;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Branch $resource
 */
class NearbyBranchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $branch = $this->resource;
        $locale = app()->getLocale();

        return [
            'id' => $branch->id,
            'name' => $branch->getTranslation('name', $locale),
            'address' => $branch->getTranslation('address', $locale) ?: null,
            'salon' => ['id' => $branch->tenant->id, 'name' => $branch->tenant->name],
            'area' => ['id' => $branch->area->id, 'name' => $branch->area->getTranslation('name', $locale)],
            'city' => ['id' => $branch->city->id, 'name' => $branch->city->getTranslation('name', $locale)],
            'lat' => (float) $branch->latitude,
            'lng' => (float) $branch->longitude,
            'distance_km' => round(((float) $branch->getAttribute('distance_m')) / 1000, 1),
            'cover_image_url' => $branch->coverImageUrl(),
            'maps_url' => $branch->maps_url,
        ];
    }
}
```

- [ ] **Step 6: Add the controller**

`central-app/app/Modules/V1/Branches/Http/Controllers/NearbyBranchesController.php`:

```php
<?php

namespace App\Modules\V1\Branches\Http\Controllers;

use App\Modules\V1\Branches\Http\Requests\NearbyBranchesRequest;
use App\Modules\V1\Branches\Http\Resources\NearbyBranchResource;
use App\Modules\V1\Geo\Http\Resources\ResolvedLocationResource;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

class NearbyBranchesController extends Controller
{
    /**
     * Public list of branches, nearest first. With `lat`/`lng` (inside Egypt) the visitor's
     * position is the origin; otherwise the request IP, then the default area.
     */
    public function __invoke(NearbyBranchesRequest $request, LocationResolver $resolver): AnonymousResourceCollection
    {
        $point = $request->point();
        $origin = $point !== null
            ? $resolver->nearest($point[0], $point[1], LocationSourceEnum::Gps)
            : $resolver->fromIp($request->ip());

        $branches = Branch::query()
            ->publiclyListed()
            ->nearestTo($origin->lat, $origin->lng)
            ->with(['tenant:id,name', 'area', 'city'])
            ->paginate($request->perPage())
            ->withQueryString();

        return NearbyBranchResource::collection($branches)->additional([
            'meta' => ['origin' => (new ResolvedLocationResource($origin))->resolve($request)],
        ]);
    }
}
```

- [ ] **Step 7: Add the route and load it**

`central-app/app/Modules/V1/Branches/routes/api.php`:

```php
<?php

use App\Modules\V1\Branches\Http\Controllers\NearbyBranchesController;
use App\Modules\V1\Customer\Auth\Http\Middleware\SetApiLocale;
use Illuminate\Support\Facades\Route;

// عام للزوار: مرتّب بالمسافة من موقعهم (أو الـ IP) فمفيش cache مشترك
Route::prefix('api/v1/branches')
    ->middleware([SetApiLocale::class, 'throttle:60,1'])
    ->group(function () {
        Route::get('nearby', NearbyBranchesController::class);
    });
```

In `BranchesServiceProvider::boot()`, replace the `//` body with:

```php
        $this->loadRoutesFrom(__DIR__.'/routes/api.php');
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `cd apps/bltdreeg-server/central-app && C:/programs/php-8.4.5/php.exe artisan test --filter=NearbyBranchesTest`
Expected: 8 passed.

If `meta.origin` is missing, check that the paginated response merged `additional` (Laravel merges it recursively into `meta`). If the paginator count query fails because of the select binding, replace `select`/`selectRaw` with `addSelect`. Then run the Geo suite to make sure nothing else broke: `--filter=Geo`.

- [ ] **Step 9: Commit**

```bash
git add central-app/app/Modules/V1/Branches/routes central-app/app/Modules/V1/Branches/Http central-app/app/Modules/V1/Branches/BranchesServiceProvider.php packages/core/src/Modules/Tenancy/Models/Branch.php central-app/tests/Feature/Branches/NearbyBranchesTest.php
git commit -m "feat(branches): public nearby branches endpoint ordered by gps or ip origin"
```

---

### Task 2: Web data layer (types, mapper, action, query keys, infinite query hook)

**Files:**
- Modify: `apps/web/src/lib/types/paginated.interface.ts`
- Create: `apps/web/src/lib/types/branch/nearby-branch.interface.ts`, `apps/web/src/lib/types/branch/index.ts`
- Create: `apps/web/src/lib/utils/branches/branch-mapper.ts`, `apps/web/src/lib/utils/branches/branch-mapper.test.ts`
- Create: `apps/web/src/lib/actions/branches/branches.action.ts`
- Modify: `apps/web/src/lib/data/constants/query-keys.constants.ts`
- Create: `apps/web/src/lib/hooks/branches/use-nearby-branches.hook.ts`, `apps/web/src/lib/hooks/branches/index.ts`

**Interfaces:**
- Consumes: the Task 1 HTTP contract; `apiClient` from `@/lib/api` (its `get<T>()` resolves to the response body, as in `geo.action.ts`); `ResolvedLocation` and `mapResolvedLocation` from the existing geo types and mappers.
- Produces:
  - `type QueryPosition = { lat: number; lng: number }` (defined in Task 3's `query-position.ts`; this task imports it as a type only)
  - `getNearbyBranches(params: { position: QueryPosition | null; page: number; perPage?: number }): Promise<NearbyBranchesPage>`
  - `useNearbyBranches(position: QueryPosition | null, enabled: boolean)`, an `useInfiniteQuery` result
  - `QK_NEARBY_BRANCHES(position: QueryPosition | null)`, `QK_VISITOR_POSITION`

> Task 3 creates `query-position.ts`. If you do Task 2 first, create that file now with only the exported type `export type QueryPosition = { lat: number; lng: number };`. Task 3 adds the functions.

- [ ] **Step 1: Write the failing mapper test**

`apps/web/src/lib/utils/branches/branch-mapper.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { mapNearbyBranchesPage } from "./branch-mapper.ts";

const origin = {
  governorate: { id: "EG01", name: "القاهرة" },
  city: { id: "EG0111", name: "قصر النيل" },
  area: { id: "EG011103", name: "جاردن سيتي" },
  lat: 30.044,
  lng: 31.236,
  source: "ip" as const,
};

test("maps a laravel page to camelCase", () => {
  const page = mapNearbyBranchesPage({
    data: [
      {
        id: 7,
        name: "فرع المعادي",
        address: null,
        salon: { id: 3, name: "Salon X" },
        area: { id: "EG011103", name: "جاردن سيتي" },
        city: { id: "EG0111", name: "قصر النيل" },
        lat: 30.0444,
        lng: 31.2357,
        distance_km: 1.4,
        cover_image_url: null,
        maps_url: "https://maps.app.goo.gl/x",
      },
    ],
    meta: { current_page: 1, last_page: 3, per_page: 12, total: 30, origin },
  });

  assert.deepEqual(page.items[0], {
    id: "7",
    name: "فرع المعادي",
    address: null,
    salon: { id: "3", name: "Salon X" },
    area: { id: "EG011103", name: "جاردن سيتي" },
    city: { id: "EG0111", name: "قصر النيل" },
    lat: 30.0444,
    lng: 31.2357,
    distanceKm: 1.4,
    coverImageUrl: null,
    mapsUrl: "https://maps.app.goo.gl/x",
  });
  assert.equal(page.page, 1);
  assert.equal(page.lastPage, 3);
  assert.equal(page.total, 30);
  assert.equal(page.origin.source, "ip");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd apps/web && pnpm test`
Expected: FAIL, "Cannot find module './branch-mapper.ts'".

- [ ] **Step 3: Write the types and the mapper**

`apps/web/src/lib/types/paginated.interface.ts` (replace the stub):

```ts
// صفحة من Laravel paginator بعد التحويل لـ camelCase
export interface Paginated<T> {
  items: T[];
  page: number;
  lastPage: number;
  perPage: number;
  total: number;
}
```

`apps/web/src/lib/types/branch/nearby-branch.interface.ts`:

```ts
// فرع صالون في قائمة "الأقرب ليك" — /branches/nearby في Laravel
import type { NamedRef, ResolvedLocation } from "@/lib/types/geo";
import type { Paginated } from "@/lib/types/paginated.interface";

export interface NearbyBranch {
  id: string;
  name: string;
  address: string | null;
  salon: NamedRef;
  area: NamedRef;
  city: NamedRef;
  lat: number;
  lng: number;
  distanceKm: number;
  coverImageUrl: string | null;
  mapsUrl: string | null;
}

export interface NearbyBranchesPage extends Paginated<NearbyBranch> {
  /** النقطة اللي اترتّب منها: gps لو العميل سمح، وإلا ip أو default */
  origin: ResolvedLocation;
}
```

`apps/web/src/lib/types/branch/index.ts`:

```ts
export type * from "./nearby-branch.interface";
```

`apps/web/src/lib/utils/branches/branch-mapper.ts`. Imports use `.ts`-free paths except for types, so the node test runner can load the file. Use only `import type` from aliases:

```ts
// تحويل رد /branches/nearby من snake_case لأنواع الواجهة
import type { NearbyBranch, NearbyBranchesPage } from "@/lib/types/branch";
import type { ResolvedLocation } from "@/lib/types/geo";

type RawRef = { id: string | number; name: string };

export interface RawNearbyBranch {
  id: number;
  name: string;
  address: string | null;
  salon: RawRef;
  area: RawRef;
  city: RawRef;
  lat: number;
  lng: number;
  distance_km: number;
  cover_image_url: string | null;
  maps_url: string | null;
}

export interface RawNearbyBranchesPage {
  data: RawNearbyBranch[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; origin: ResolvedLocation };
}

const ref = (raw: RawRef) => ({ id: String(raw.id), name: raw.name });

export function mapNearbyBranch(raw: RawNearbyBranch): NearbyBranch {
  return {
    id: String(raw.id),
    name: raw.name,
    address: raw.address,
    salon: ref(raw.salon),
    area: ref(raw.area),
    city: ref(raw.city),
    lat: raw.lat,
    lng: raw.lng,
    distanceKm: raw.distance_km,
    coverImageUrl: raw.cover_image_url,
    mapsUrl: raw.maps_url,
  };
}

export function mapNearbyBranchesPage(raw: RawNearbyBranchesPage): NearbyBranchesPage {
  return {
    items: raw.data.map(mapNearbyBranch),
    page: raw.meta.current_page,
    lastPage: raw.meta.last_page,
    perPage: raw.meta.per_page,
    total: raw.meta.total,
    origin: raw.meta.origin,
  };
}
```

(`meta.origin` already has the `ResolvedLocation` shape: `mapResolvedLocation` is an identity copy, so no mapping is needed.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/web && pnpm test`
Expected: PASS. The existing `location-choice.test.ts` still passes too.

- [ ] **Step 5: Add the action, query keys and hook**

`apps/web/src/lib/data/constants/query-keys.constants.ts`. Note that line 6 currently has two exports on one line (`...["location-prefill"] as const;export const QK_GEO_GOVERNORATES`). Split them onto separate lines while editing, then append:

```ts
/** موقع الزائر من المتصفح — مفصول عن QK_LOCATION_PREFILL (ده بتاع الأونبوردنج وبيطلب estimate لازمه login) */
export const QK_VISITOR_POSITION = ["visitor-position"] as const;
/** null = الترتيب من الـ IP؛ لما الإحداثيات توصل المفتاح بيتغير والقائمة بتتجاب تاني */
export const QK_NEARBY_BRANCHES = (position: { lat: number; lng: number } | null) =>
  ["branches", "nearby", position ? `${position.lat},${position.lng}` : "ip"] as const;
```

`apps/web/src/lib/actions/branches/branches.action.ts`:

```ts
// أقرب الفروع للزائر — /branches/nearby في Laravel (عام، من غير login)
import { apiClient } from "@/lib/api";
import type { NearbyBranchesPage } from "@/lib/types/branch";
import { mapNearbyBranchesPage, type RawNearbyBranchesPage } from "@/lib/utils/branches/branch-mapper";
import type { QueryPosition } from "@/lib/utils/location/query-position";

export async function getNearbyBranches(params: {
  position: QueryPosition | null;
  page: number;
  perPage?: number;
}): Promise<NearbyBranchesPage> {
  const response = await apiClient.get<RawNearbyBranchesPage>("/branches/nearby", {
    params: {
      page: params.page,
      per_page: params.perPage,
      // من غير إحداثيات السيرفر بيرتّب من الـ IP
      ...(params.position ?? {}),
    },
  });
  return mapNearbyBranchesPage(response);
}
```

`apps/web/src/lib/hooks/branches/use-nearby-branches.hook.ts`:

```ts
"use client";

// قائمة الفروع بالأقرب، صفحة ورا صفحة — بتتجاب تاني لوحدها لما الإحداثيات توصل
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getNearbyBranches } from "@/lib/actions/branches/branches.action";
import { QK_NEARBY_BRANCHES } from "@/lib/data/constants/query-keys.constants";
import type { QueryPosition } from "@/lib/utils/location/query-position";

export function useNearbyBranches(position: QueryPosition | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: QK_NEARBY_BRANCHES(position),
    queryFn: ({ pageParam }) => getNearbyBranches({ position, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.lastPage ? last.page + 1 : undefined),
    // القائمة القديمة (من الـ IP) تفضل ظاهرة لحد ما بتاعة الـ GPS توصل — من غير skeleton في النص
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    enabled,
  });
}
```

`apps/web/src/lib/hooks/branches/index.ts`:

```ts
export * from "./use-nearby-branches.hook";
```

- [ ] **Step 6: Type-check and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint src/lib/actions/branches src/lib/hooks/branches src/lib/utils/branches src/lib/types/branch src/lib/types/paginated.interface.ts src/lib/data/constants/query-keys.constants.ts`
Expected: no errors. If Task 3 isn't done yet, the stub `query-position.ts` from the note above must exist.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/types/paginated.interface.ts apps/web/src/lib/types/branch apps/web/src/lib/utils/branches apps/web/src/lib/actions/branches apps/web/src/lib/hooks/branches apps/web/src/lib/data/constants/query-keys.constants.ts apps/web/src/lib/utils/location/query-position.ts
git commit -m "feat(web): nearby branches action and infinite query hook"
```

---

### Task 3: Coordinate rounding helper

**Files:**
- Create or complete: `apps/web/src/lib/utils/location/query-position.ts`
- Test: `apps/web/src/lib/utils/location/query-position.test.ts`

**Interfaces:**
- Consumes: `isInEgypt(lat, lng): boolean` from `src/lib/utils/location/location-choice.ts`; `BrowserPosition` from `src/lib/utils/location/browser-position.ts`.
- Produces: `type QueryPosition = { lat: number; lng: number }` and `toQueryPosition(position: BrowserPosition | undefined): QueryPosition | null`.

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { toQueryPosition } from "./query-position.ts";

test("rounds to 3 decimals", () => {
  assert.deepEqual(toQueryPosition({ lat: 30.044412, lng: 31.235712 }), { lat: 30.044, lng: 31.236 });
});

test("errors, missing data and points outside egypt give null (server falls back to ip)", () => {
  assert.equal(toQueryPosition(undefined), null);
  assert.equal(toQueryPosition({ error: "denied" }), null);
  assert.equal(toQueryPosition({ lat: 51.5, lng: -0.12 }), null);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd apps/web && pnpm test`
Expected: FAIL, `toQueryPosition` is not exported.

- [ ] **Step 3: Implement it**

Check how `location-choice.ts` is imported in its own test. The node runner needs relative `.ts` imports, so use the same style here:

```ts
// الإحداثيات اللي بتتبعت للسيرفر وبتدخل في الـ query key: 3 أرقام عشرية (~100م) تكفي للترتيب بالأقرب،
// وبتثبّت المفتاح فالقائمة ماتتجابش تاني مع كل تغيير صغير في الموقع
import type { BrowserPosition } from "./browser-position.ts";
import { isInEgypt } from "./location-choice.ts";

export type QueryPosition = { lat: number; lng: number };

const round = (value: number) => Math.round(value * 1000) / 1000;

export function toQueryPosition(position: BrowserPosition | undefined): QueryPosition | null {
  if (!position || "error" in position || !isInEgypt(position.lat, position.lng)) return null;
  return { lat: round(position.lat), lng: round(position.lng) };
}
```

If `tsconfig` rejects `.ts` extensions in imports (`allowImportingTsExtensions`), copy whatever `location-choice.test.ts` and its subject already do.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/web && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/utils/location/query-position.ts apps/web/src/lib/utils/location/query-position.test.ts
git commit -m "feat(web): round visitor coordinates before querying nearby branches"
```

---

### Task 4: `useVisitorPosition`: ask for permission on visit and follow permission changes

**Files:**
- Create: `apps/web/src/lib/hooks/geo/use-visitor-position.hook.ts`
- Modify: `apps/web/src/lib/hooks/geo/index.ts` (add the export)

**Interfaces:**
- Consumes: `requestBrowserPosition(timeoutMs): Promise<BrowserPosition>`, `toQueryPosition`, `QK_VISITOR_POSITION`.
- Produces: `useVisitorPosition(): { position: QueryPosition | null; permission: VisitorPermission; settled: boolean; locating: boolean; requestPosition: () => void }`, where `type VisitorPermission = PermissionState | "unsupported" | null` (`null` means the check is still running).

The rules, which also cover Review Focus 1–3:

| Permission | Ask the browser? | `settled` (the list may load) |
|---|---|---|
| `null` (checking) | no | false |
| `prompt` | yes, which shows the prompt | **true right away** (the IP list loads while the prompt is open) |
| `granted` | yes | only once the position request finished (one request, with coordinates) |
| `denied` | no (the browser won't ask again) | true (IP list) |
| `unsupported` | yes | true |

When the permission changes to `granted` after a failed request (prompt dismissed, then allowed from site settings), refetch the position. The new coordinates change the branches query key, so the list updates.

- [ ] **Step 1: Write the hook**

```ts
"use client";

// إذن الموقع لأي زائر: بنطلبه أول ما يفتح الموقع، ومنستناهوش — القائمة بتتجاب من الـ IP لحد ما يسمح
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QK_VISITOR_POSITION } from "@/lib/data/constants/query-keys.constants";
import { requestBrowserPosition } from "@/lib/utils/location/browser-position";
import { toQueryPosition } from "@/lib/utils/location/query-position";

export type VisitorPermission = PermissionState | "unsupported" | null;

export function useVisitorPosition() {
  const [permission, setPermission] = useState<VisitorPermission>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      setPermission("unsupported");
      return;
    }
    let status: PermissionStatus | undefined;
    let cancelled = false;
    const onChange = () => status && setPermission(status.state);
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        status = result;
        setPermission(result.state);
        result.addEventListener("change", onChange);
      })
      .catch(() => !cancelled && setPermission("unsupported"));
    return () => {
      cancelled = true;
      status?.removeEventListener("change", onChange);
    };
  }, []);

  const query = useQuery({
    queryKey: QK_VISITOR_POSITION,
    queryFn: () => requestBrowserPosition(15000),
    // denied: المتصفح مش هيسأل تاني، فمفيش لازمة نطلب
    enabled: permission !== null && permission !== "denied",
    staleTime: Infinity,
    retry: false,
  });

  // سمح بعد ما رفض/قفل الـ prompt (من إعدادات المتصفح): نجيب الموقع تاني فالقائمة تتحدث
  const { refetch, data } = query;
  const failed = !!data && "error" in data;
  useEffect(() => {
    if (permission === "granted" && failed) void refetch();
  }, [permission, failed, refetch]);

  const requestPosition = useCallback(() => void refetch(), [refetch]);

  return {
    position: toQueryPosition(data),
    permission,
    // سمح قبل كده: نستنى الإحداثيات بدل ما نجيب قائمة الـ IP وبعدها بثانية قائمة تانية
    settled: permission !== null && !(permission === "granted" && query.isPending),
    locating: query.isFetching,
    requestPosition,
  };
}
```

Add `export * from "./use-visitor-position.hook";` to `src/lib/hooks/geo/index.ts`. Match the existing export style in that file.

- [ ] **Step 2: Type-check and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint src/lib/hooks/geo`
Expected: no errors. (`react-hooks/set-state-in-effect` may flag the `setPermission("unsupported")` call. If it does, initialise the state lazily instead: `useState<VisitorPermission>(() => typeof navigator !== "undefined" && !navigator.permissions?.query ? "unsupported" : null)`. Then remove that branch from the effect.)

- [ ] **Step 3: Manual check in the browser (no test runner for hooks in this app)**

Run `pnpm dev` and open the page from Task 5 once it exists. Or temporarily render `JSON.stringify(useVisitorPosition())` in a scratch client component and remove it afterwards. Check, in Chrome DevTools → Sensors / site settings:
1. Fresh profile: `permission` is `prompt` and `settled` is `true` while the prompt is open. Allowing it fills `position`.
2. Reload after allowing: `permission` is `granted`, and `settled` stays `false` until `position` is filled.
3. Dismiss the prompt, then allow from the lock icon. `position` fills without a reload.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/hooks/geo/use-visitor-position.hook.ts apps/web/src/lib/hooks/geo/index.ts
git commit -m "feat(web): visitor position hook that follows location permission changes"
```

---

### Task 5: Home page "salons near you" section

**Files:**
- Create: `apps/web/src/components/molecules/branch-card/branch-card.tsx`, `index.ts`
- Create: `apps/web/src/app/[locale]/(marketing)/__components/nearby-branches/nearby-branches.tsx`, `index.ts`
- Modify: `apps/web/src/app/[locale]/(marketing)/page.tsx`
- Modify: `apps/web/src/i18n/messages/ar.json`, `apps/web/src/i18n/messages/en.json`

**Interfaces:**
- Consumes: `useVisitorPosition()` (Task 4), `useNearbyBranches(position, enabled)` (Task 2), `NearbyBranch` (Task 2), `formatDistance(km, locale)` from `@/lib/utils/format/price.utils`, `PageContainer`, `Button`/`buttonVariants`, and the empty-state molecule in `src/components/molecules/empty-state`.
- Produces: `<NearbyBranches />` (no props).

- [ ] **Step 1: Add the strings**

Under `marketing.home` in `ar.json`:

```json
"nearby": {
  "title": "صالونات قريبة منك",
  "titleIn": "صالونات قريبة من {area}",
  "approximate": "الترتيب تقريبي حسب منطقتك.",
  "useMyLocation": "استخدم موقعي بالظبط",
  "locating": "بنحدد موقعك…",
  "loadMore": "عرض المزيد",
  "empty": "مفيش صالونات قريبة لسه.",
  "error": "مقدرناش نجيب الصالونات. جرّب تاني.",
  "retry": "حاول تاني"
}
```

Under `marketing.home` in `en.json`:

```json
"nearby": {
  "title": "Salons near you",
  "titleIn": "Salons near {area}",
  "approximate": "Approximate order based on your area.",
  "useMyLocation": "Use my exact location",
  "locating": "Finding your location…",
  "loadMore": "Load more",
  "empty": "No salons near you yet.",
  "error": "We couldn't load salons. Try again.",
  "retry": "Try again"
}
```

Then run `pnpm i18n:scan` if the repo expects the parser output to be committed. Check `git diff` on the messages afterwards.

- [ ] **Step 2: Write `BranchCard`**

Look at `shop-card.tsx` for the card styling tokens (rounded `14px`, `border-border`, `bg-card`) and reuse them. Do not reuse `ShopCard` itself: it needs rating, price and next-slot fields that branches don't have yet.

```tsx
import { MapPin, Scissors } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import type { NearbyBranch } from "@/lib/types/branch";
import { cn } from "@/lib/utils/cn.utils";
import { formatDistance } from "@/lib/utils/format/price.utils";

type BranchCardProps = { branch: NearbyBranch; className?: string };

function BranchCard({ branch, className }: BranchCardProps) {
  const locale = useLocale();

  return (
    <article className={cn("flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-border bg-card", className)}>
      <div className="relative aspect-[4/3] bg-muted">
        {branch.coverImageUrl ? (
          // unoptimized: الصور من storage الـ Laravel ومش متعرّفة في remotePatterns
          <Image src={branch.coverImageUrl} alt={branch.name} fill unoptimized className="object-cover" />
        ) : (
          <Scissors aria-hidden className="absolute inset-0 m-auto size-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate text-[15px] font-bold">{branch.salon.name}</h3>
        <p className="truncate text-[13px] text-muted-foreground">{branch.name}</p>
        <p className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{branch.area.name} · {formatDistance(branch.distanceKm, locale)}</span>
        </p>
      </div>
    </article>
  );
}

export { BranchCard };
```

`index.ts`: `export * from "./branch-card";` (match the sibling `shop-card/index.ts`).

- [ ] **Step 3: Write the section**

```tsx
"use client";

// "صالونات قريبة منك": من الـ IP فورًا، وبتتحدث لوحدها لما الزائر يسمح بالموقع
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/atoms/page-container";
import { BranchCard } from "@/components/molecules/branch-card";
import { useNearbyBranches } from "@/lib/hooks/branches";
import { useVisitorPosition } from "@/lib/hooks/geo";

function NearbyBranches() {
  const t = useTranslations("marketing.home.nearby");
  const { position, permission, settled, locating, requestPosition } = useVisitorPosition();
  const branches = useNearbyBranches(position, settled);

  const pages = branches.data?.pages ?? [];
  const items = pages.flatMap((page) => page.items);
  const origin = pages[0]?.origin;
  const approximate = origin && origin.source !== "gps";

  return (
    <PageContainer as="section" className="flex flex-col gap-3 pt-6 md:pt-11">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold md:text-[21px]">
          {origin ? t("titleIn", { area: origin.area.name }) : t("title")}
        </h2>
        {approximate && (
          <p className="flex flex-wrap items-center gap-2 text-[13.5px] text-muted-foreground">
            {t("approximate")}
            {/* بعد الرفض المتصفح مش هيسأل تاني فمالوش لازمة الزرار */}
            {permission !== "denied" && (
              <button type="button" onClick={requestPosition} disabled={locating} className="font-bold text-primary disabled:opacity-60">
                {locating ? t("locating") : t("useMyLocation")}
              </button>
            )}
          </p>
        )}
      </div>

      {branches.isPending ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[14px] bg-muted" />
          ))}
        </div>
      ) : branches.isError ? (
        <p className="text-[13.5px] text-muted-foreground">
          {t("error")}{" "}
          <button type="button" onClick={() => void branches.refetch()} className="font-bold text-primary">
            {t("retry")}
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="text-[13.5px] text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 ${branches.isPlaceholderData ? "opacity-60" : ""}`}>
            {items.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
          {branches.hasNextPage && (
            <button
              type="button"
              onClick={() => void branches.fetchNextPage()}
              disabled={branches.isFetchingNextPage}
              className="self-center rounded-full border border-border px-5 py-2 text-[13.5px] font-bold disabled:opacity-60"
            >
              {t("loadMore")}
            </button>
          )}
        </>
      )}
    </PageContainer>
  );
}

export { NearbyBranches };
```

Replace the raw `<button>`s with the project's `Button` atom (`src/components/atoms/button`) if its variants fit (`variant="link"` / `variant="outline"`). Check its props first.

`index.ts`: `export * from "./nearby-branches";`

- [ ] **Step 4: Render it on the home page**

In `apps/web/src/app/[locale]/(marketing)/page.tsx`, import `NearbyBranches` from `./__components/nearby-branches` and render `<NearbyBranches />` directly after `<Hero ... />`. Leave the mock rails as they are; replacing them is out of scope.

- [ ] **Step 5: Type-check, lint, test**

Run: `cd apps/web && npx tsc --noEmit && npx eslint src/components/molecules/branch-card "src/app/[locale]/(marketing)" && pnpm test`
Expected: no errors; all node tests pass.

- [ ] **Step 6: End-to-end manual check**

Start the central API (`apps/bltdreeg-server/central-app`, port `8011`, the web default `NEXT_PUBLIC_API_URL`) and `pnpm dev` in `apps/web`. Make sure the web origin is in `CORS_ALLOWED_ORIGINS`. Have at least two approved tenants with active branches in different cities. Then:
1. Fresh browser profile, open `/ar`. The location prompt appears. Behind the prompt, the section already shows branches with "صالونات قريبة من <IP area>" and "الترتيب تقريبي".
2. Click **Allow**. The list fades for a moment, then reorders, the title shows the GPS area, and the "approximate" line disappears. In the network tab, the second `/branches/nearby` request has `lat`/`lng`.
3. Reload. There is exactly one `/branches/nearby` request, and it has `lat`/`lng`.
4. Block location, reload. You get the IP list and no "use my location" button.
5. Click **Load more**. Page 2 is appended, and the distances keep increasing.

On localhost, the IP is `127.0.0.1`, so the origin source will be `default`. Test the IP path through the devtunnel. If it still shows `default` there, check that `TRUSTED_PROXIES` is set so `$request->ip()` returns the real client IP; see the next section.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/molecules/branch-card "apps/web/src/app/[locale]/(marketing)/__components/nearby-branches" "apps/web/src/app/[locale]/(marketing)/page.tsx" apps/web/src/i18n/messages/ar.json apps/web/src/i18n/messages/en.json
git commit -m "feat(web): salons near you section on the home page"
```

---

## Notes and decisions to confirm

- **The client IP behind proxies.** IP fallback only works if `$request->ip()` is the visitor's IP. Behind the devtunnel or a load balancer, that depends on `TRUSTED_PROXIES` in `central-app/bootstrap/app.php`. There is an uncommitted change there that also trusts `X-Forwarded-Host`; the security review flagged it. `X-Forwarded-For` is the only header this feature needs.
- **Branch cards are not links yet.** The salon page (`ROUTE_SALON`) still uses mock shops and there is no public branch-details endpoint. Linking the card is a follow-up once that page reads real data.
- **Logged-in customers.** They already have a confirmed location (`customers.area_id`, `last_lat`/`last_lng`). The plan treats them like any visitor: browser GPS, else IP. Falling back to their saved location instead of the IP could be a small later improvement.
- **No HTTP caching.** The response depends on the visitor's IP or coordinates. It is deliberately not given `cache.headers` like the `/geo` lists.
