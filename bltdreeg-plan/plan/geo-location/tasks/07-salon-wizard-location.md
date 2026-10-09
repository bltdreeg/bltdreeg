# 07 · Salon wizard: location step (map, GPS, Maps link, IP, dropdowns)

**Depends on:** 03, 06 · **Decisions:** D8, D10, D11, D13, D15 · **Review Focus:** #3, #4

Root: `apps/bltdreeg-server/`. Read `tenant-app/.ai/rules/index.md` (if present) and every rule it maps to `app/Modules/V1/Onboarding/**` and `resources/views/**` before editing.

**Files:**
- Modify: `tenant-app/app/Modules/V1/Onboarding/Filament/Pages/Onboarding.php` (address step, mount, new Livewire methods, review entries)
- Create: `tenant-app/resources/views/filament/onboarding/location-map.blade.php`
- Modify: `tenant-app/app/Modules/V1/Onboarding/Services/OnboardingService.php` (`PAYLOAD_KEYS`, `submit()`, `saveFirstBranch()`)
- Modify: `packages/core/lang/{ar,en}/onboarding.php` (`wizard.*` keys)
- Test: `tenant-app/tests/Feature/SalonOnboardingLocationTest.php`. The existing `tenant-app/tests/Feature/SalonOnboardingTest.php` must stay green; add the geo fields to its fill data.

**Interfaces:**
- Consumes: `LocationResolver`, `ResolvedLocation`, `LocationSourceEnum`, `EgyptBounds` (Task 02); `GoogleMapsLinkResolver::resolve()` (Task 03); `GeoGovernorate::options()`, `GeoCity::optionsFor()`, `GeoArea::optionsFor()` (Task 01); `ResolvedLocation::toBranchColumns()` (Task 06 columns)
- Produces:
  - Wizard state keys `data.governorate_id`, `data.city_id`, `data.area_id`, `data.latitude`, `data.longitude`, `data.location_source` (label) and `data.maps_url` (not dehydrated)
  - Page methods `pinMoved(float $lat, float $lng, string $source = 'manual'): void`, `applyMapsUrl(): void`, `areaChosen(string $areaId): void`
  - Submission payload adds `governorate_id`, `city_id`, `area_id`, `location_source`. `latitude`/`longitude` are now always set.
  - `OnboardingService::submit()` throws `DomainException('Invalid location.')` when the area doesn't belong to the submitted city/governorate.

---

- [ ] **Step 1: Lang keys**

Add these under `wizard` in `packages/core/lang/en/onboarding.php`:
```php
'location_step' => 'Location',
'location_intro' => 'We pre-filled your location. Check it, move the pin, or paste a Google Maps link.',
'location_intro_area_only' => 'Choose the area you serve from. We pre-filled it from your connection.',
'use_my_location' => 'Use my current location',
'location_denied' => 'Location permission was denied. Move the pin or paste a Google Maps link instead.',
'location_unavailable' => "We couldn't get your location. Move the pin or paste a Google Maps link instead.",
'maps_url' => 'Google Maps link',
'maps_url_placeholder' => 'https://maps.app.goo.gl/…',
'maps_url_apply' => 'Use link',
'maps_url_invalid' => "We couldn't read a location in Egypt from this link.",
'outside_egypt' => 'The location must be inside Egypt.',
'approximate_location' => 'This is an approximate location from your connection. Please check it.',
```
and the Arabic equivalents in `ar/onboarding.php`:
```php
'location_step' => 'الموقع',
'location_intro' => 'جهّزنا موقعك مبدئياً. راجعه، أو حرّك الدبوس، أو الصق رابط جوجل ماب.',
'location_intro_area_only' => 'اختار المنطقة اللي بتخدم منها. جهّزناها مبدئياً من اتصالك.',
'use_my_location' => 'استخدم موقعي الحالي',
'location_denied' => 'تم رفض إذن الموقع. حرّك الدبوس أو الصق رابط جوجل ماب بدلاً من ذلك.',
'location_unavailable' => 'معرفناش نجيب موقعك. حرّك الدبوس أو الصق رابط جوجل ماب بدلاً من ذلك.',
'maps_url' => 'رابط جوجل ماب',
'maps_url_placeholder' => 'https://maps.app.goo.gl/…',
'maps_url_apply' => 'استخدم الرابط',
'maps_url_invalid' => 'معرفناش نقرا موقع داخل مصر من الرابط ده.',
'outside_egypt' => 'لازم الموقع يكون داخل مصر.',
'approximate_location' => 'ده موقع تقريبي من اتصالك. من فضلك راجعه.',
```

- [ ] **Step 2: Write the failing tests**

`tenant-app/tests/Feature/SalonOnboardingLocationTest.php`. First copy the `beforeEach` and the "registered salon owner on the onboarding page" setup from `SalonOnboardingTest.php`: tenant in DRAFT, user acting, `Filament::setTenant`, and the `Storage`/`Notification` fakes. Then add:
```php
use App\Modules\V1\Onboarding\Filament\Pages\Onboarding;
use App\Modules\V1\Onboarding\Services\OnboardingService;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;

function ipIsIn(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

test('mount pre-fills the location from the ip', function () {
    ipIsIn(new Coordinates(31.2001, 29.9187));

    Livewire::test(Onboarding::class)
        ->assertSet('data.governorate_id', 'EG02')
        ->assertSet('data.city_id', 'EG0204')
        ->assertSet('data.area_id', 'EG020405')
        ->assertSet('data.location_source', 'ip');
});

test('mount falls back to the default area when ip is unknown', function () {
    ipIsIn(null);

    Livewire::test(Onboarding::class)
        ->assertSet('data.area_id', 'EG011103')
        ->assertSet('data.location_source', 'default');
});

test('moving the pin resolves the dropdowns and keeps the exact point', function () {
    ipIsIn(null);

    Livewire::test(Onboarding::class)
        ->call('pinMoved', 31.2001, 29.9187, 'gps')
        ->assertSet('data.area_id', 'EG020405')
        ->assertSet('data.latitude', 31.2001)
        ->assertSet('data.location_source', 'gps');
});

test('a pin outside egypt is ignored', function () {
    ipIsIn(null);

    Livewire::test(Onboarding::class)
        ->call('pinMoved', 51.5074, -0.1278, 'manual')
        ->assertSet('data.area_id', 'EG011103')
        ->assertNotified();
});

test('a pasted google maps link moves the pin', function () {
    ipIsIn(null);
    Http::preventStrayRequests();

    Livewire::test(Onboarding::class)
        ->set('data.maps_url', 'https://www.google.com/maps/place/X/@31.19,29.90,17z/data=!3d31.2001!4d29.9187')
        ->call('applyMapsUrl')
        ->assertHasNoErrors()
        ->assertSet('data.area_id', 'EG020405')
        ->assertSet('data.location_source', 'maps_url');
});

test('an unreadable maps link shows an error and changes nothing', function () {
    ipIsIn(null);

    Livewire::test(Onboarding::class)
        ->set('data.maps_url', 'https://evil.example.com/@31.2,29.9,15z')
        ->call('applyMapsUrl')
        ->assertHasErrors(['data.maps_url'])
        ->assertSet('data.area_id', 'EG011103');
});

test('choosing an area in another city moves the pin to its centroid', function () {
    ipIsIn(null);
    $area = GeoArea::query()->findOrFail('EG020405');

    Livewire::test(Onboarding::class)
        ->call('areaChosen', 'EG020405')
        ->assertSet('data.city_id', 'EG0204')
        ->assertSet('data.governorate_id', 'EG02')
        ->assertSet('data.latitude', $area->lat)
        ->assertSet('data.location_source', 'manual');
});

test('submit saves the location on the first branch', function () {
    ipIsIn(null);

    submitWizard(['service_location_type' => ['physical'], 'address' => '12 Street']); // helper below
    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', currentTenant()->getKey())->firstOrFail();

    expect($branch->area_id)->toBe('EG011103')
        ->and($branch->city_id)->toBe('EG0111')
        ->and($branch->latitude)->toBeFloat();
});

test('mobile-only salons still get a location from the dropdowns', function () {
    ipIsIn(new Coordinates(31.2001, 29.9187));

    submitWizard(['service_location_type' => ['mobile']]);
    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', currentTenant()->getKey())->firstOrFail();

    expect($branch->area_id)->toBe('EG020405');
});

test('submit rejects area that does not belong to city', function () {
    app(OnboardingService::class)->submit(currentTenant(), currentUser(), [
        ...validAnswers(),
        'governorate_id' => 'EG01',
        'city_id' => 'EG0111',
        'area_id' => 'EG020405',
    ], fakeDocumentPath());
})->throws(DomainException::class, 'Invalid location.');
```
Write the helpers `submitWizard(array $overrides)`, `validAnswers()`, `currentTenant()`, `currentUser()` and `fakeDocumentPath()` by extracting what `SalonOnboardingTest.php` already does to fill and submit the wizard. If that file already has such helpers, reuse them via `tests/Pest.php`. `submitWizard` must `->set()` the other fields, `->call('submit')`, and `->assertHasNoErrors()`. It leaves the location fields to the IP pre-fill.

- [ ] **Step 3: Run it to verify it fails**

Run (in `tenant-app`): `php artisan test --compact tests/Feature/SalonOnboardingLocationTest.php`
Expected: FAIL. `data.governorate_id` is null, and the method `pinMoved` does not exist.

- [ ] **Step 4: Rework the address step in `Onboarding.php`**

Imports to add: `Filament\Actions\Action`, `Filament\Forms\Components\Hidden`, `Filament\Schemas\Components\Utilities\Set`, `Filament\Schemas\Components\View`, `Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation`, `Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum`, `Bltdreeg\Core\Modules\Geo\Models\{GeoArea,GeoCity,GeoGovernorate}`, `Bltdreeg\Core\Modules\Geo\Support\{EgyptBounds,GoogleMapsLinkResolver,LocationResolver}`.

Replace the whole `Step::make('address')` with:
```php
Step::make('address')
    ->label(__('core::onboarding.wizard.location_step'))
    ->schema([
        Text::make(fn (Get $get): string => $this->requiresAddress($get)
            ? __('core::onboarding.wizard.location_intro')
            : __('core::onboarding.wizard.location_intro_area_only')),
        Text::make(__('core::onboarding.wizard.approximate_location'))
            ->visible(fn (Get $get): bool => in_array($get('location_source'), ['ip', 'default'], true)),
        View::make('filament.onboarding.location-map')
            ->visible(fn (Get $get): bool => $this->requiresAddress($get)),
        TextInput::make('maps_url')
            ->label(__('core::onboarding.wizard.maps_url'))
            ->placeholder(__('core::onboarding.wizard.maps_url_placeholder'))
            ->dehydrated(false)
            ->visible(fn (Get $get): bool => $this->requiresAddress($get))
            ->suffixAction(
                Action::make('applyMapsUrl')
                    ->label(__('core::onboarding.wizard.maps_url_apply'))
                    ->icon('heroicon-m-map-pin')
                    ->action(fn () => $this->applyMapsUrl()),
            ),
        Grid::make(3)->schema([
            Select::make('governorate_id')
                ->label(__('core::geo.governorate'))
                ->options(fn (): array => GeoGovernorate::options())
                ->searchable()
                ->required()
                ->live()
                ->afterStateUpdated(function (Set $set): void {
                    $set('city_id', null);
                    $set('area_id', null);
                }),
            Select::make('city_id')
                ->label(__('core::geo.city'))
                ->options(fn (Get $get): array => GeoCity::optionsFor($get('governorate_id')))
                ->searchable()
                ->required()
                ->live()
                ->afterStateUpdated(function (Set $set, ?string $state): void {
                    $areas = GeoArea::optionsFor($state);
                    $set('area_id', null);

                    // مدن "خارج الزمام" ليها منطقة واحدة بس — نختارها تلقائياً
                    if (count($areas) === 1) {
                        $this->areaChosen((string) array_key_first($areas));
                    }
                }),
            Select::make('area_id')
                ->label(__('core::geo.area'))
                ->options(fn (Get $get): array => GeoArea::optionsFor($get('city_id')))
                ->searchable()
                ->required()
                ->live()
                ->afterStateUpdated(function (?string $state): void {
                    if (filled($state)) {
                        $this->areaChosen($state);
                    }
                }),
        ]),
        Textarea::make('address')
            ->label(__('core::onboarding.wizard.address'))
            ->rows(2)
            ->maxLength(500)
            ->required(fn (Get $get): bool => $this->requiresAddress($get))
            ->visible(fn (Get $get): bool => $this->requiresAddress($get)),
        Hidden::make('latitude')->required(),
        Hidden::make('longitude')->required(),
        Hidden::make('location_source')->required(),
    ]),
```

In `mount()`, add the new keys to the `->only([...])` list: `'governorate_id', 'city_id', 'area_id', 'location_source'`. After `$this->form->fill(...)`, add:
```php
if (blank($this->data['area_id'] ?? null)) {
    $this->applyResolved(app(LocationResolver::class)->fromIp(request()->ip()));
}
```

Add the page methods:
```php
public function pinMoved(float $lat, float $lng, string $source = 'manual'): void
{
    if (! EgyptBounds::contains($lat, $lng)) {
        Notification::make()->title(__('core::onboarding.wizard.outside_egypt'))->danger()->send();

        return;
    }

    $source = $source === 'gps' ? LocationSourceEnum::Gps : LocationSourceEnum::Manual;

    $this->applyResolved(app(LocationResolver::class)->nearest($lat, $lng, $source));
}

public function applyMapsUrl(): void
{
    $this->resetErrorBag('data.maps_url');

    $coordinates = app(GoogleMapsLinkResolver::class)->resolve((string) ($this->data['maps_url'] ?? ''));

    if ($coordinates === null) {
        $this->addError('data.maps_url', __('core::onboarding.wizard.maps_url_invalid'));

        return;
    }

    $this->applyResolved(app(LocationResolver::class)->nearest($coordinates->lat, $coordinates->lng, LocationSourceEnum::MapsUrl));
}

public function areaChosen(string $areaId): void
{
    $lat = is_numeric($this->data['latitude'] ?? null) ? (float) $this->data['latitude'] : null;
    $lng = is_numeric($this->data['longitude'] ?? null) ? (float) $this->data['longitude'] : null;
    $source = LocationSourceEnum::tryFromLabel($this->data['location_source'] ?? null) ?? LocationSourceEnum::Manual;

    $this->applyResolved(app(LocationResolver::class)->forArea($areaId, $lat, $lng, $source));
}

protected function applyResolved(ResolvedLocation $location): void
{
    $this->data['governorate_id'] = $location->governorateId();
    $this->data['city_id'] = $location->cityId();
    $this->data['area_id'] = $location->areaId();
    $this->data['latitude'] = $location->lat;
    $this->data['longitude'] = $location->lng;
    $this->data['location_source'] = $location->source->label();
}
```

In `reviewEntries()`, add this after `review_service_location_type`:
```php
TextEntry::make('review_location')
    ->label(__('core::geo.location'))
    ->state(fn (Get $get): ?string => collect([
        GeoArea::query()->find($get('area_id'))?->getTranslation('name', app()->getLocale()),
        GeoCity::query()->find($get('city_id'))?->getTranslation('name', app()->getLocale()),
        GeoGovernorate::query()->find($get('governorate_id'))?->getTranslation('name', app()->getLocale()),
    ])->filter()->implode('، ') ?: null),
```

- [ ] **Step 5: The map view**

`tenant-app/resources/views/filament/onboarding/location-map.blade.php`:
```blade
@assets
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
@endassets

{{-- الخريطة بتتحكم في latitude/longitude؛ أي تحريك بيرجع للسيرفر يحدّد المحافظة/المدينة/المنطقة --}}
<div
    wire:ignore
    x-data="{
        map: null,
        marker: null,
        error: null,
        lat: $wire.$entangle('data.latitude'),
        lng: $wire.$entangle('data.longitude'),
        init() {
            const start = [Number(this.lat) || 30.0444, Number(this.lng) || 31.2357];
            this.map = L.map(this.$refs.map).setView(start, 15);
            L.tileLayer(@js(config('geo.map_tile_url')), { attribution: @js(config('geo.map_attribution')), maxZoom: 19 }).addTo(this.map);
            this.marker = L.marker(start, { draggable: true }).addTo(this.map);
            this.marker.on('dragend', () => this.moved(this.marker.getLatLng(), 'manual'));
            this.map.on('click', (event) => this.moved(event.latlng, 'manual'));
            this.$watch('lat', () => this.syncMarker());
            this.$watch('lng', () => this.syncMarker());
            // الخطوة بتبقى مخفية لحد ما المستخدم يوصلها؛ Leaflet محتاج يعيد الحساب لما تظهر
            new ResizeObserver(() => this.map.invalidateSize()).observe(this.$refs.map);
        },
        moved(point, source) {
            this.marker.setLatLng(point);
            $wire.pinMoved(point.lat, point.lng, source);
        },
        syncMarker() {
            if (! this.lat || ! this.lng) return;
            const point = [Number(this.lat), Number(this.lng)];
            this.marker.setLatLng(point);
            this.map.panTo(point);
        },
        useMyLocation() {
            this.error = null;
            if (! navigator.geolocation) {
                this.error = @js(__('core::onboarding.wizard.location_unavailable'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.map.setZoom(17);
                    this.moved({ lat: position.coords.latitude, lng: position.coords.longitude }, 'gps');
                },
                (failure) => {
                    this.error = failure.code === 1
                        ? @js(__('core::onboarding.wizard.location_denied'))
                        : @js(__('core::onboarding.wizard.location_unavailable'));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
            );
        },
    }"
    class="space-y-3"
>
    <div x-ref="map" class="h-80 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-white/10"></div>

    <x-filament::button type="button" color="gray" icon="heroicon-m-map-pin" x-on:click="useMyLocation">
        {{ __('core::onboarding.wizard.use_my_location') }}
    </x-filament::button>

    <p x-show="error" x-text="error" class="text-sm text-danger-600 dark:text-danger-400"></p>
</div>
```
Before committing, check the SRI hashes against https://leafletjs.com/download.html. If the `x-filament::button` blade component doesn't accept `x-on:click` in this Filament version, use a plain `<button type="button" class="fi-btn …">`.

- [ ] **Step 6: Save the location in `OnboardingService`**

Add `'governorate_id', 'city_id', 'area_id', 'location_source'` to `PAYLOAD_KEYS` (after `'longitude'`). Extend the `@param` array shape of `submit()` to match.

In `submit()`, after `$needsAddress = …`:
```php
$location = $this->resolveLocation($answers);
```
In the payload, replace the `latitude`/`longitude` lines with:
```php
'latitude' => $location->lat,
'longitude' => $location->lng,
'governorate_id' => $location->governorateId(),
'city_id' => $location->cityId(),
'area_id' => $location->areaId(),
'location_source' => $location->source->label(),
```
Pass `$location` to `saveFirstBranch(...)` in place of the `$needsAddress` lat/lng logic. In the `fill([...])` there, drop `'latitude'`/`'longitude'` and add `...$location->toBranchColumns(),`.

Add:
```php
/**
 * @param  array<string, mixed>  $answers
 */
private function resolveLocation(array $answers): ResolvedLocation
{
    $area = GeoArea::query()->find($answers['area_id'] ?? null);

    if ($area === null
        || $area->city_id !== ($answers['city_id'] ?? null)
        || $area->governorate_id !== ($answers['governorate_id'] ?? null)) {
        throw new DomainException('Invalid location.');
    }

    $lat = is_numeric($answers['latitude'] ?? null) ? (float) $answers['latitude'] : null;
    $lng = is_numeric($answers['longitude'] ?? null) ? (float) $answers['longitude'] : null;
    $source = LocationSourceEnum::tryFromLabel($answers['location_source'] ?? null) ?? LocationSourceEnum::Manual;

    return app(LocationResolver::class)->forArea($area->id, $lat, $lng, $source);
}
```
The page's `catch (DomainException)` shows "not available". That is acceptable here: only a tampered request reaches it, because the dependent selects can't produce a mismatch.

- [ ] **Step 7: Keep the existing wizard tests green**

In `SalonOnboardingTest.php`, add `'governorate_id' => 'EG01', 'city_id' => 'EG0111', 'area_id' => 'EG011103'` wherever a test builds answers for `OnboardingService::submit()` directly (Livewire tests get them from the IP pre-fill). Replace assertions on `payload.latitude === null` for non-physical salons with the default-area centroid.

- [ ] **Step 8: Run the tests**

Run (in `tenant-app`): `php artisan test --compact tests/Feature/SalonOnboardingLocationTest.php tests/Feature/SalonOnboardingTest.php`
Expected: all pass.

- [ ] **Step 9: Manual check in the browser**

Run `composer run dev` (or the repo's `dev.ps1`), register a salon and open the wizard. Then check:
- The map shows a pin at the IP or default location.
- Dragging the pin updates the three selects.
- "Use my location" prompts for permission. Deny shows the denied message.
- Pasting `https://maps.app.goo.gl/<real link>` moves the pin.
- Picking a mobile-only service type hides the map and keeps the selects.

- [ ] **Step 10: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add tenant-app packages/core/lang
git commit -m "feat(salon-onboarding): first-branch location with map, gps, google maps link and ip prefill"
```
