<?php

declare(strict_types=1);

use App\Modules\V1\Branches\Filament\Resources\Branches\Pages\CreateBranch;
use App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Pages\ListCustomers;
use App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Pages\ViewCustomer;
use App\Modules\V1\Onboarding\Support\SubmissionComparison;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    Filament::setCurrentPanel('admin');
    $this->actingAs(User::factory()->superAdmin()->create());
});

test('admin creates a branch by choosing an area and the coordinates default to its centroid', function () {
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

    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->getKey())->sole();

    expect($branch->area_id)->toBe('EG020405')
        ->and($branch->city_id)->toBe('EG0204')
        ->and($branch->governorate_id)->toBe('EG02')
        ->and($branch->latitude)->toBe($area->lat);
});

test('changing the governorate clears the city and the area', function () {
    Livewire::test(CreateBranch::class)
        ->fillForm(['governorate_id' => 'EG02', 'city_id' => 'EG0204', 'area_id' => 'EG020405'])
        ->fillForm(['governorate_id' => 'EG01'])
        ->assertFormSet(['city_id' => null, 'area_id' => null]);
});

test('a branch cannot be created without a location', function () {
    $tenant = Tenant::factory()->create();

    Livewire::test(CreateBranch::class)
        ->fillForm(['tenant_id' => $tenant->getKey(), 'name' => 'No place'])
        ->call('create')
        ->assertHasFormErrors(['governorate_id', 'city_id', 'area_id', 'latitude', 'longitude']);
});

test('the customer page shows governorate, city and area', function () {
    app()->setLocale('en');
    $customer = Customer::factory()->inAlexandria()->create();

    Livewire::test(ViewCustomer::class, ['record' => $customer->getRouteKey()])
        ->assertFormSet([
            'governorate_name' => 'Alexandria',
            'city_name' => GeoCity::query()->findOrFail('EG0204')->getTranslation('name', 'en'),
            'area_name' => GeoArea::query()->findOrFail('EG020405')->getTranslation('name', 'en'),
        ]);
});

test('the customers table can be filtered by governorate', function () {
    $cairo = Customer::factory()->create();
    $alexandria = Customer::factory()->inAlexandria()->create();

    Livewire::test(ListCustomers::class)
        ->filterTable('governorate_id', 'EG02')
        ->assertCanSeeTableRecords([$alexandria])
        ->assertCanNotSeeTableRecords([$cairo]);
});

test('submission comparison shows division names', function () {
    app()->setLocale('en');
    $tenant = Tenant::factory()->create();

    $submission = TenantOnboardingSubmission::query()->create([
        'tenant_id' => $tenant->getKey(),
        'submitted_by_user_id' => null,
        'payload' => ['business_name' => 'X', 'governorate_id' => 'EG02', 'city_id' => 'EG0204', 'area_id' => 'EG020405'],
        'status' => SubmissionStatusEnum::PENDING,
        'revision' => 1,
    ]);

    $rows = collect(SubmissionComparison::rows($submission))->keyBy('label');

    expect($rows[__('core::geo.governorate')]['current'])->toBe('Alexandria')
        ->and($rows[__('core::geo.area')]['current'])->toBe(GeoArea::query()->findOrFail('EG020405')->getTranslation('name', 'en'));
});
