# 02 · LocationResolver, source enum, IP geolocator → core

**Depends on:** 01 · **Decisions:** D5, D6, D7, D8, D14

Root: `apps/bltdreeg-server/`.

**Files:**
- Modify: `packages/core/composer.json`: add `"geoip2/geoip2": "^3.4"` to `require`. Then run `composer update bltdreeg/core geoip2/geoip2` in **both** `central-app` and `tenant-app`, and remove `geoip2/geoip2` from `central-app/composer.json`.
- Create: `packages/core/src/Modules/Geo/Enums/LocationSourceEnum.php` (replaces `central-app/app/Modules/V1/Customer/Auth/Enums/LocationSourceEnum.php`, which is deleted)
- Create: `packages/core/src/Modules/Geo/Contracts/IpGeolocator.php`, `packages/core/src/Modules/Geo/Data/Coordinates.php`, `packages/core/src/Modules/Geo/Support/MaxMindIpGeolocator.php`. Delete the three originals under `central-app/app/Modules/V1/Customer/Auth/Location/`.
- Create: `packages/core/src/Modules/Geo/Support/EgyptBounds.php`
- Create: `packages/core/src/Modules/Geo/Data/ResolvedLocation.php`
- Create: `packages/core/src/Modules/Geo/Support/LocationResolver.php`
- Modify: `packages/core/src/Providers/CoreServiceProvider.php`: bind `IpGeolocator` → `MaxMindIpGeolocator` (singleton)
- Modify: `central-app/app/Modules/V1/Customer/CustomerServiceProvider.php`: remove its `IpGeolocator` binding (line ~43)
- Modify: `central-app/app/Modules/V1/Customer/Auth/Http/Requests/UpdateLocationRequest.php`: `inEgypt()` delegates to `EgyptBounds::contains()`
- Modify: `central-app/config/customer_auth.php`: delete the `location` block (now `geo.maxmind_db_path`)
- Modify: every importer of the moved classes. Find them with:
  `grep -rln "Customer\\\\Auth\\\\Enums\\\\LocationSourceEnum\|Customer\\\\Auth\\\\Location\\\\" central-app/app central-app/tests`
- Test: `central-app/tests/Unit/Geo/LocationSourceEnumTest.php`, `central-app/tests/Feature/Geo/LocationResolverTest.php`

**Interfaces:**
- Consumes: `GeoArea` (Task 01), `config('geo.default_area_id')`, `config('geo.maxmind_db_path')`
- Produces:
  - `enum LocationSourceEnum: int { Gps=1; Ip=2; Manual=3; MapsUrl=4; Default=5 }` with `label(): string` (`gps|ip|manual|maps_url|default`), `static tryFromLabel(?string): ?self`, `trustRank(): int`, `canBeReplacedAutomaticallyBy(self $incoming): bool`
  - `EgyptBounds::contains(float $lat, float $lng): bool`, `EgyptBounds::LAT = [21.5, 32.0]`, `EgyptBounds::LNG = [24.5, 37.0]`
  - `final readonly class ResolvedLocation(GeoArea $area, float $lat, float $lng, LocationSourceEnum $source)` with `governorateId(): string`, `cityId(): string`, `areaId(): string`, `withSource(LocationSourceEnum): self`, `toCustomerColumns(): array`, `toBranchColumns(): array`
  - `LocationResolver::nearest(float $lat, float $lng, LocationSourceEnum $source): ResolvedLocation` (keeps the given point)
  - `LocationResolver::fromIp(?string $ip): ResolvedLocation` (source `Ip`, or the fallback)
  - `LocationResolver::fallback(): ResolvedLocation` (default area centroid, source `Default`)
  - `LocationResolver::forArea(string $areaId, ?float $lat, ?float $lng, LocationSourceEnum $source): ResolvedLocation` (rule D8; throws `ModelNotFoundException` for an unknown area)

---

- [ ] **Step 1: Write the failing tests**

`central-app/tests/Unit/Geo/LocationSourceEnumTest.php`:
```php
<?php

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum as Source;

test('automatic updates respect the trust order', function (Source $current, Source $incoming, bool $replaces) {
    expect($current->canBeReplacedAutomaticallyBy($incoming))->toBe($replaces);
})->with([
    'ip refreshes ip' => [Source::Ip, Source::Ip, true],
    'ip replaces default' => [Source::Default, Source::Ip, true],
    'ip never replaces gps' => [Source::Gps, Source::Ip, false],
    'gps refreshes gps' => [Source::Gps, Source::Gps, true],
    'gps never replaces manual' => [Source::Manual, Source::Gps, false],
    'gps never replaces maps url' => [Source::MapsUrl, Source::Gps, false],
]);

test('labels round-trip', function () {
    foreach (Source::cases() as $case) {
        expect(Source::tryFromLabel($case->label()))->toBe($case);
    }

    expect(Source::tryFromLabel('nope'))->toBeNull()
        ->and(Source::tryFromLabel(null))->toBeNull();
});
```

`central-app/tests/Feature/Geo/LocationResolverTest.php`:
```php
<?php

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function fakeIp(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

test('nearest resolves a known point and keeps the exact point', function () {
    $location = app(LocationResolver::class)->nearest(30.0444, 31.2357, LocationSourceEnum::Gps);

    expect($location->areaId())->toBe('EG011103')
        ->and($location->cityId())->toBe('EG0111')
        ->and($location->governorateId())->toBe('EG01')
        ->and($location->lat)->toBe(30.0444)
        ->and($location->source)->toBe(LocationSourceEnum::Gps);
});

test('nearest resolves alexandria and a different cairo city', function () {
    $resolver = app(LocationResolver::class);

    expect($resolver->nearest(31.2001, 29.9187, LocationSourceEnum::Gps)->areaId())->toBe('EG020405')
        ->and($resolver->nearest(30.0626, 31.2497, LocationSourceEnum::Gps)->cityId())->toBe('EG0113');
});

test('fromIp uses the ip point', function () {
    fakeIp(new Coordinates(31.2001, 29.9187));

    $location = app(LocationResolver::class)->fromIp('41.32.0.1');

    expect($location->areaId())->toBe('EG020405')
        ->and($location->source)->toBe(LocationSourceEnum::Ip);
});

test('fromIp falls back to default for foreign ip, unknown ip and null ip', function (?Coordinates $coordinates, ?string $ip) {
    fakeIp($coordinates);

    $location = app(LocationResolver::class)->fromIp($ip);

    expect($location->areaId())->toBe('EG011103')
        ->and($location->source)->toBe(LocationSourceEnum::Default)
        ->and($location->lat)->toBe(GeoArea::query()->findOrFail('EG011103')->lat);
})->with([
    'london' => [new Coordinates(51.5074, -0.1278), '81.2.69.142'],
    'lookup failed' => [null, '41.32.0.1'],
    'no ip' => [null, null],
]);

test('forArea keeps the point when it is in the same city', function () {
    $location = app(LocationResolver::class)->forArea('EG011102', 30.0444, 31.2357, LocationSourceEnum::Gps);

    expect($location->areaId())->toBe('EG011102')
        ->and($location->lat)->toBe(30.0444)
        ->and($location->source)->toBe(LocationSourceEnum::Gps);
});

test('forArea moves to the area centroid when the point is in another city', function () {
    $location = app(LocationResolver::class)->forArea('EG020405', 30.0444, 31.2357, LocationSourceEnum::Gps);
    $area = GeoArea::query()->findOrFail('EG020405');

    expect($location->cityId())->toBe('EG0204')
        ->and($location->lat)->toBe($area->lat)
        ->and($location->lng)->toBe($area->lng)
        ->and($location->source)->toBe(LocationSourceEnum::Manual);
});

test('forArea without a point uses the centroid as manual', function () {
    $location = app(LocationResolver::class)->forArea('EG011102', null, null, LocationSourceEnum::Ip);

    expect($location->lat)->toBe(GeoArea::query()->findOrFail('EG011102')->lat)
        ->and($location->source)->toBe(LocationSourceEnum::Manual);
});

test('columns helpers', function () {
    $location = app(LocationResolver::class)->nearest(30.0444, 31.2357, LocationSourceEnum::Gps);

    expect($location->toCustomerColumns())->toMatchArray([
        'governorate_id' => 'EG01', 'city_id' => 'EG0111', 'area_id' => 'EG011103',
        'last_lat' => 30.0444, 'last_lng' => 31.2357, 'location_source' => 1,
    ])->and($location->toBranchColumns())->toMatchArray([
        'governorate_id' => 'EG01', 'city_id' => 'EG0111', 'area_id' => 'EG011103',
        'latitude' => 30.0444, 'longitude' => 31.2357, 'location_source' => 1,
    ]);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run (in `central-app`): `php artisan test --compact tests/Unit/Geo tests/Feature/Geo/LocationResolverTest.php`
Expected: FAIL. The class `Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum` is not found.

- [ ] **Step 3: Move the dependency and the IP classes**

Edit `packages/core/composer.json` → `require`: `"geoip2/geoip2": "^3.4"`. Remove it from `central-app/composer.json`. Then, in each app:
```bash
composer update bltdreeg/core geoip2/geoip2 --no-interaction
```

`packages/core/src/Modules/Geo/Data/Coordinates.php`:
```php
<?php

namespace Bltdreeg\Core\Modules\Geo\Data;

final readonly class Coordinates
{
    public function __construct(
        public float $lat,
        public float $lng,
    ) {}
}
```

`packages/core/src/Modules/Geo/Contracts/IpGeolocator.php`:
```php
<?php

namespace Bltdreeg\Core\Modules\Geo\Contracts;

use Bltdreeg\Core\Modules\Geo\Data\Coordinates;

interface IpGeolocator
{
    public function locate(string $ip): ?Coordinates;
}
```

`packages/core/src/Modules/Geo/Support/MaxMindIpGeolocator.php`: copy the central-app class verbatim, then make three changes:
- Change the namespace to `Bltdreeg\Core\Modules\Geo\Support`.
- Update the imports to the core `IpGeolocator`/`Coordinates`.
- Read the path from `config('geo.maxmind_db_path')`.

Delete the three originals under `central-app/app/Modules/V1/Customer/Auth/Location/`.

In `CoreServiceProvider::register()`:
```php
$this->app->singleton(IpGeolocator::class, MaxMindIpGeolocator::class);
```
Remove the binding line from `CustomerServiceProvider`.

- [ ] **Step 4: Enum + bounds**

`packages/core/src/Modules/Geo/Enums/LocationSourceEnum.php`:
```php
<?php

namespace Bltdreeg\Core\Modules\Geo\Enums;

enum LocationSourceEnum: int
{
    case Gps = 1;
    case Ip = 2;
    case Manual = 3; // المستخدم اختار المنطقة/الدبوس بنفسه — أعلى ثقة
    case MapsUrl = 4;
    case Default = 5; // مفيش GPS ولا IP صالح — القاهرة الافتراضية

    public function label(): string
    {
        return match ($this) {
            self::Gps => 'gps',
            self::Ip => 'ip',
            self::Manual => 'manual',
            self::MapsUrl => 'maps_url',
            self::Default => 'default',
        };
    }

    public static function tryFromLabel(?string $label): ?self
    {
        foreach (self::cases() as $case) {
            if ($case->label() === $label) {
                return $case;
            }
        }

        return null;
    }

    public function trustRank(): int
    {
        return match ($this) {
            self::Default => 0,
            self::Ip => 1,
            self::Gps => 2,
            self::Manual, self::MapsUrl => 3,
        };
    }

    /**
     * An automatic update (IP fallback, background GPS) never replaces a more trusted or user-chosen value.
     */
    public function canBeReplacedAutomaticallyBy(self $incoming): bool
    {
        return $this->trustRank() < 3 && $incoming->trustRank() >= $this->trustRank();
    }
}
```
Delete `central-app/app/Modules/V1/Customer/Auth/Enums/LocationSourceEnum.php`. Then repoint every import, and replace each `LocationSourceEnum::fromLabel(...)` call with `LocationSourceEnum::tryFromLabel(...) ?? LocationSourceEnum::Gps`:
```bash
grep -rl "Customer\\\\Auth\\\\Enums\\\\LocationSourceEnum" central-app/app central-app/tests | xargs sed -i 's/App\\Modules\\V1\\Customer\\Auth\\Enums\\LocationSourceEnum/Bltdreeg\\Core\\Modules\\Geo\\Enums\\LocationSourceEnum/g'
grep -rl "Customer\\\\Auth\\\\Location\\\\" central-app/app central-app/tests | xargs sed -i -e 's/App\\Modules\\V1\\Customer\\Auth\\Location\\Contracts\\IpGeolocator/Bltdreeg\\Core\\Modules\\Geo\\Contracts\\IpGeolocator/g' -e 's/App\\Modules\\V1\\Customer\\Auth\\Location\\Data\\Coordinates/Bltdreeg\\Core\\Modules\\Geo\\Data\\Coordinates/g'
grep -rn "fromLabel" central-app/app
```

`packages/core/src/Modules/Geo/Support/EgyptBounds.php`:
```php
<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

final class EgyptBounds
{
    /** @var array{0: float, 1: float} */
    public const LAT = [21.5, 32.0];

    /** @var array{0: float, 1: float} */
    public const LNG = [24.5, 37.0];

    public static function contains(float $lat, float $lng): bool
    {
        return $lat >= self::LAT[0] && $lat <= self::LAT[1]
            && $lng >= self::LNG[0] && $lng <= self::LNG[1];
    }
}
```
In `UpdateLocationRequest::inEgypt()`, make the body `return EgyptBounds::contains($lat, $lng);` and delete the `EGYPT_BOUNDS` constant (grep for any other use first).

- [ ] **Step 5: ResolvedLocation + LocationResolver**

`packages/core/src/Modules/Geo/Data/ResolvedLocation.php`:
```php
<?php

namespace Bltdreeg\Core\Modules\Geo\Data;

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;

final readonly class ResolvedLocation
{
    public function __construct(
        public GeoArea $area,
        public float $lat,
        public float $lng,
        public LocationSourceEnum $source,
    ) {}

    public function governorateId(): string
    {
        return $this->area->governorate_id;
    }

    public function cityId(): string
    {
        return $this->area->city_id;
    }

    public function areaId(): string
    {
        return $this->area->id;
    }

    public function withSource(LocationSourceEnum $source): self
    {
        return new self($this->area, $this->lat, $this->lng, $source);
    }

    /**
     * @return array{governorate_id: string, city_id: string, area_id: string, last_lat: float, last_lng: float, location_source: int, location_updated_at: \Illuminate\Support\Carbon}
     */
    public function toCustomerColumns(): array
    {
        return [
            'governorate_id' => $this->governorateId(),
            'city_id' => $this->cityId(),
            'area_id' => $this->areaId(),
            'last_lat' => $this->lat,
            'last_lng' => $this->lng,
            'location_source' => $this->source->value,
            'location_updated_at' => now(),
        ];
    }

    /**
     * @return array{governorate_id: string, city_id: string, area_id: string, latitude: float, longitude: float, location_source: int}
     */
    public function toBranchColumns(): array
    {
        return [
            'governorate_id' => $this->governorateId(),
            'city_id' => $this->cityId(),
            'area_id' => $this->areaId(),
            'latitude' => $this->lat,
            'longitude' => $this->lng,
            'location_source' => $this->source->value,
        ];
    }
}
```

`packages/core/src/Modules/Geo/Support/LocationResolver.php`:
```php
<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;

/**
 * Turns a point, an IP or a chosen area into a full governorate/city/area location.
 * Areas only have centroids (no polygons), so "which area" = nearest centroid.
 */
class LocationResolver
{
    /** Box half-widths in degrees, widened until candidates exist. null = all areas. */
    private const SEARCH_DELTAS = [0.05, 0.2, 1.0, null];

    public function __construct(private IpGeolocator $ipGeolocator) {}

    public function nearest(float $lat, float $lng, LocationSourceEnum $source): ResolvedLocation
    {
        foreach (self::SEARCH_DELTAS as $delta) {
            $query = GeoArea::query();

            if ($delta !== null) {
                $query->whereBetween('lat', [$lat - $delta, $lat + $delta])
                    ->whereBetween('lng', [$lng - $delta, $lng + $delta]);
            }

            $nearest = $query->get()
                ->sortBy(fn (GeoArea $area): float => self::distanceKm($lat, $lng, $area->lat, $area->lng))
                ->first();

            if ($nearest !== null) {
                return new ResolvedLocation($nearest, $lat, $lng, $source);
            }
        }

        return $this->fallback();
    }

    public function fromIp(?string $ip): ResolvedLocation
    {
        $coordinates = $ip === null ? null : $this->ipGeolocator->locate($ip);

        // VPN بيطلّع دولة تانية: منقبلش نقطة برا مصر
        if ($coordinates === null || ! EgyptBounds::contains($coordinates->lat, $coordinates->lng)) {
            return $this->fallback();
        }

        return $this->nearest($coordinates->lat, $coordinates->lng, LocationSourceEnum::Ip);
    }

    public function fallback(): ResolvedLocation
    {
        $area = GeoArea::query()->findOrFail(config('geo.default_area_id'));

        return new ResolvedLocation($area, $area->lat, $area->lng, LocationSourceEnum::Default);
    }

    /**
     * The user picked an area. Keep their precise point only if it lies in the same city.
     */
    public function forArea(string $areaId, ?float $lat, ?float $lng, LocationSourceEnum $source): ResolvedLocation
    {
        $area = GeoArea::query()->findOrFail($areaId);

        if ($lat !== null && $lng !== null && EgyptBounds::contains($lat, $lng)
            && $this->nearest($lat, $lng, $source)->cityId() === $area->city_id) {
            return new ResolvedLocation($area, $lat, $lng, $source);
        }

        return new ResolvedLocation($area, $area->lat, $area->lng, LocationSourceEnum::Manual);
    }

    private static function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 6371 * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
```

- [ ] **Step 6: Run the new tests and the existing location tests**

Run: `php artisan test --compact tests/Unit/Geo tests/Feature/Geo tests/Feature/CustomerAuth/MeEndpointsTest.php`
Expected: all pass. `MeEndpointsTest` still passes, because only the imports moved.

- [ ] **Step 7: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add -A packages/core central-app tenant-app/composer.json tenant-app/composer.lock
git commit -m "feat(geo): location resolver, shared source enum and ip geolocator in core"
```
