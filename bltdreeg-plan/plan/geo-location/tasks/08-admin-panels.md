# 08 · Central admin: Branch, Customer, submission review

**Depends on:** 04, 06, 07 · **Decisions:** D1, D4, D8

Root: `apps/bltdreeg-server/central-app/`. Read `.ai/rules/index.md` and the rules mapped to `app/Modules/V1/**/Filament/**`.

**Files:**
- Modify: `app/Modules/V1/Branches/Filament/Resources/Branches/BranchResource.php` (`form()` lines 58–88, `table()` columns)
- Modify: `app/Modules/V1/Customer/Auth/Filament/Resources/Customers/Schemas/CustomerForm.php` ("Location & Terms" section)
- Modify: `app/Modules/V1/Customer/Auth/Filament/Resources/Customers/Tables/CustomersTable.php` (add a governorate/city column + filter)
- Modify: `app/Modules/V1/Onboarding/Support/SubmissionComparison.php` (`fields()`, `present()`)
- Test: `tests/Feature/Geo/AdminGeoTest.php`. The existing `tests/Feature/OnboardingReviewTest.php` must stay green.

**Interfaces:**
- Consumes: `GeoGovernorate::options()`, `GeoCity::optionsFor()`, `GeoArea::optionsFor()` (Task 01); `LocationResolver::forArea()`, `LocationSourceEnum` (Task 02); Branch/Customer relations (Tasks 04, 06); payload keys `governorate_id`, `city_id`, `area_id` (Task 07)
- Produces: admin UI only. There are no new public interfaces.

---

- [ ] **Step 1: Write the failing test**

`tests/Feature/Geo/AdminGeoTest.php`. Copy the admin-login setup (super admin `User`, `actingAs`, panel) from `tests/Feature/OnboardingReviewTest.php`. Then:
```php
use App\Modules\V1\Branches\Filament\Resources\Branches\Pages\CreateBranch;
use App\Modules\V1\Onboarding\Support\SubmissionComparison;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Livewire\Livewire;

test('admin creates a branch by choosing an area; coordinates default to its centroid', function () {
    $tenant = Tenant::factory()->create();
    $area = GeoArea::query()->findOrFail('EG020405');

    Livewire::test(CreateBranch::class)
        ->fillForm([
            'tenant_id' => $tenant->getKey(),
            'name' => 'Smouha',
            'governorate_id' => 'EG02',
            'city_id' => 'EG0204',
            'area_id' => 'EG020405',
        ])
        ->assertFormSet(['latitude' => $area->lat, 'longitude' => $area->lng])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Branch::query()->withoutGlobalScopes()->latest('id')->first()->area_id)->toBe('EG020405');
});

test('changing the governorate clears city and area', function () {
    Livewire::test(CreateBranch::class)
        ->fillForm(['governorate_id' => 'EG02', 'city_id' => 'EG0204', 'area_id' => 'EG020405'])
        ->fillForm(['governorate_id' => 'EG01'])
        ->assertFormSet(['city_id' => null, 'area_id' => null]);
});

test('submission comparison shows division names', function () {
    $submission = TenantOnboardingSubmission::factory()->create([
        'payload' => ['business_name' => 'X', 'governorate_id' => 'EG02', 'city_id' => 'EG0204', 'area_id' => 'EG020405'],
    ]);

    app()->setLocale('en');
    $rows = collect(SubmissionComparison::rows($submission))->keyBy('label');

    expect($rows[__('core::geo.governorate')]['current'])->toBe('Alexandria')
        ->and($rows[__('core::geo.area')]['current'])->toBe(GeoArea::query()->findOrFail('EG020405')->getTranslation('name', 'en'));
});
```
If `TenantOnboardingSubmission` has no factory, build the row the way `OnboardingReviewTest.php` does. If the `name` field is translatable in the form (e.g. `name.ar`/`name.en`), fill it the way the existing form expects.

- [ ] **Step 2: Run it to verify it fails**

Run: `php artisan test --compact tests/Feature/Geo/AdminGeoTest.php`
Expected: FAIL. The form has no `governorate_id` component.

- [ ] **Step 3: Branch form**

In `BranchResource::form()`, replace the `latitude` and `longitude` `TextInput`s with:
```php
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
        ->afterStateUpdated(fn (Set $set) => $set('area_id', null)),
    Select::make('area_id')
        ->label(__('core::geo.area'))
        ->options(fn (Get $get): array => GeoArea::optionsFor($get('city_id')))
        ->searchable()
        ->required()
        ->live()
        ->afterStateUpdated(function (Get $get, Set $set, ?string $state): void {
            if (blank($state)) {
                return;
            }

            $lat = is_numeric($get('latitude')) ? (float) $get('latitude') : null;
            $lng = is_numeric($get('longitude')) ? (float) $get('longitude') : null;
            $location = app(LocationResolver::class)->forArea($state, $lat, $lng, LocationSourceEnum::Manual);

            $set('latitude', $location->lat);
            $set('longitude', $location->lng);
            $set('location_source', $location->source->value);
        }),
]),
TextInput::make('latitude')
    ->label(__('core::branches.latitude'))
    ->numeric()
    ->required()
    ->minValue(EgyptBounds::LAT[0])
    ->maxValue(EgyptBounds::LAT[1]),
TextInput::make('longitude')
    ->label(__('core::branches.longitude'))
    ->numeric()
    ->required()
    ->minValue(EgyptBounds::LNG[0])
    ->maxValue(EgyptBounds::LNG[1]),
Hidden::make('location_source')->default(LocationSourceEnum::Manual->value),
```
Imports: `Filament\Forms\Components\Hidden`, `Filament\Schemas\Components\Grid`, `Filament\Schemas\Components\Utilities\{Get,Set}`, the Geo models, `EgyptBounds`, `LocationResolver`, `LocationSourceEnum`. Use the same `Get`/`Set` namespaces as `tenant-app/.../Onboarding.php` (which already imports `Filament\Schemas\Components\Utilities\Get`).

In `table()`, add after `address`:
```php
TextColumn::make('city.name')
    ->label(__('core::geo.city'))
    ->formatStateUsing(fn (Branch $record): string => $record->city->getTranslation('name', app()->getLocale()))
    ->sortable(),
```

- [ ] **Step 4: Customer view (read-only)**

In `CustomerForm`, in the "Location & Terms" section, add these before `last_lat`:
```php
TextInput::make('governorate_name')
    ->label(__('core::geo.governorate'))
    ->formatStateUsing(fn (Customer $record): string => $record->governorate->getTranslation('name', app()->getLocale()))
    ->disabled(),
TextInput::make('city_name')
    ->label(__('core::geo.city'))
    ->formatStateUsing(fn (Customer $record): string => $record->city->getTranslation('name', app()->getLocale()))
    ->disabled(),
TextInput::make('area_name')
    ->label(__('core::geo.area'))
    ->formatStateUsing(fn (Customer $record): string => $record->area->getTranslation('name', app()->getLocale()))
    ->disabled(),
TextInput::make('location_confirmed_at')
    ->label('Location Confirmed At')
    ->disabled(),
```
If `formatStateUsing` doesn't run for a field with no attribute on the model, use `->afterStateHydrated(fn (TextInput $component, Customer $record) => $component->state(...))` instead. Copy whichever pattern sibling disabled fields in the file already use.

In `CustomersTable`, add a `TextColumn::make('city.name')` the same way as for branches, plus a `SelectFilter::make('governorate_id')->options(fn (): array => GeoGovernorate::options())->label(__('core::geo.governorate'))`.

- [ ] **Step 5: Submission comparison**

In `SubmissionComparison::fields()`, add these after `'longitude'`:
```php
'governorate_id' => __('core::geo.governorate'),
'city_id' => __('core::geo.city'),
'area_id' => __('core::geo.area'),
```
In `present()`'s `match`, add:
```php
'governorate_id' => GeoGovernorate::query()->find($value)?->getTranslation('name', app()->getLocale()) ?? (string) $value,
'city_id' => GeoCity::query()->find($value)?->getTranslation('name', app()->getLocale()) ?? (string) $value,
'area_id' => GeoArea::query()->find($value)?->getTranslation('name', app()->getLocale()) ?? (string) $value,
```

- [ ] **Step 6: Run the tests**

Run: `php artisan test --compact tests/Feature/Geo/AdminGeoTest.php tests/Feature/OnboardingReviewTest.php`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Modules/V1/Branches app/Modules/V1/Customer/Auth/Filament app/Modules/V1/Onboarding tests/Feature/Geo
git commit -m "feat(admin): governorate/city/area on branches, customers and onboarding review"
```
