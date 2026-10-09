<?php

declare(strict_types=1);

use App\Modules\V1\Onboarding\Filament\Pages\Onboarding;
use App\Modules\V1\Onboarding\Filament\Pages\OnboardingStatus;
use App\Modules\V1\Onboarding\Services\OnboardingService;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Onboarding\Support\SalonRegistrationService;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake(TenantLegalDocument::DISK);
    Notification::fake();
});

function locationOwner(): User
{
    return app(SalonRegistrationService::class)->register([
        'salon_name' => 'Glow Studio',
        'slug' => 'glow',
        'owner_name' => 'Nour',
        'email' => 'nour@glow.test',
        'phone' => '01000000001',
        'password' => 'secret-password',
    ]);
}

function ipIsIn(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

/**
 * Logs the owner in on the salon panel and opens the wizard.
 *
 * @return array{0: Livewire\Features\SupportTesting\Testable, 1: Tenant, 2: User}
 */
function openWizard(): array
{
    $owner = locationOwner();
    $tenant = $owner->tenants()->first();

    test()->actingAs($owner);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);
    app(TenantContext::class)->set($tenant);

    return [Livewire::test(Onboarding::class), $tenant, $owner];
}

/**
 * @return array<string, mixed>
 */
function serviceAnswers(array $overrides = []): array
{
    return [
        'business_name' => 'Glow Studio',
        'website' => null,
        'team_size' => TeamSizeEnum::SMALL->value,
        'service_location_type' => ['physical'],
        'address' => '10 Tahrir Square',
        'latitude' => 30.0444,
        'longitude' => 31.2357,
        'governorate_id' => 'EG01',
        'city_id' => 'EG0111',
        'location_source' => 'manual',
        'document_type' => 'national_id',
        ...$overrides,
    ];
}

function submitServiceAnswers(Tenant $tenant, User $owner, array $overrides = []): TenantOnboardingSubmission
{
    Storage::disk(TenantLegalDocument::DISK)->put('tenants/x/id.jpg', 'fake-image');

    return app(OnboardingService::class)->submit($tenant->fresh(), $owner, serviceAnswers($overrides), 'tenants/x/id.jpg', 'id.jpg');
}

test('mount pre-fills the location from the ip', function () {
    ipIsIn(new Coordinates(31.2001, 29.9187));

    [$wizard] = openWizard();

    $wizard->assertSet('data.governorate_id', 'EG02')
        ->assertSet('data.city_id', 'EG0204')
        ->assertSet('data.location_source', 'ip');
});

test('mount falls back to the default city when the ip is unknown', function () {
    ipIsIn(null);

    [$wizard] = openWizard();

    $wizard->assertSet('data.city_id', 'EG0111')
        ->assertSet('data.location_source', 'default');
});

test('moving the pin resolves the dropdowns and keeps the exact point', function () {
    ipIsIn(null);

    [$wizard] = openWizard();

    $wizard->call('pinMoved', 31.2001, 29.9187, 'gps')
        ->assertSet('data.city_id', 'EG0204')
        ->assertSet('data.latitude', 31.2001)
        ->assertSet('data.location_source', 'gps');
});

test('a pin outside egypt is ignored', function () {
    ipIsIn(null);

    [$wizard] = openWizard();

    $wizard->call('pinMoved', 51.5074, -0.1278, 'manual')
        ->assertSet('data.city_id', 'EG0111')
        ->assertNotified();
});

test('a pasted google maps link moves the pin', function () {
    ipIsIn(null);
    Http::preventStrayRequests();

    [$wizard] = openWizard();

    $wizard->set('data.maps_url', 'https://www.google.com/maps/place/X/@31.19,29.90,17z/data=!3d31.2001!4d29.9187')
        ->call('applyMapsUrl')
        ->assertHasNoErrors()
        ->assertSet('data.city_id', 'EG0204')
        ->assertSet('data.location_source', 'maps_url');
});

test('an unreadable maps link shows an error and changes nothing', function () {
    ipIsIn(null);
    Http::preventStrayRequests();

    [$wizard] = openWizard();

    $wizard->set('data.maps_url', 'https://evil.example.com/@31.2,29.9,15z')
        ->call('applyMapsUrl')
        ->assertHasErrors(['data.maps_url'])
        ->assertSet('data.city_id', 'EG0111');
});

test('choosing a city in another governorate moves the pin to its centroid', function () {
    ipIsIn(null);
    $city = GeoCity::query()->findOrFail('EG0204');

    [$wizard] = openWizard();

    $wizard->call('cityChosen', 'EG0204')
        ->assertSet('data.city_id', 'EG0204')
        ->assertSet('data.governorate_id', 'EG02')
        ->assertSet('data.latitude', $city->lat)
        ->assertSet('data.location_source', 'manual');
});

test('submitting the wizard saves the location on the first branch', function () {
    ipIsIn(null);

    [$wizard, $tenant] = openWizard();

    $wizard->set('data.business_name', 'Glow Studio')
        ->set('data.team_size', TeamSizeEnum::SMALL->value)
        ->set('data.service_location_type', ['physical'])
        ->set('data.address', '10 Tahrir Square')
        ->set('data.document_type', 'national_id')
        ->set('data.document_file', UploadedFile::fake()->image('national-id.jpg'))
        ->call('submit')
        ->assertHasNoFormErrors()
        ->assertRedirect(OnboardingStatus::getUrl(tenant: $tenant));

    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->getKey())->sole();

    expect($branch->city_id)->toBe('EG0111')
        ->and($branch->governorate_id)->toBe('EG01')
        ->and($branch->latitude)->toBeFloat();
});

test('mobile-only salons keep the city they picked from the dropdowns', function () {
    $owner = locationOwner();
    $tenant = $owner->tenants()->first();

    submitServiceAnswers($tenant, $owner, [
        'service_location_type' => ['mobile'],
        'address' => null,
        'latitude' => null,
        'longitude' => null,
        'city_id' => 'EG0204',
        'governorate_id' => 'EG02',
    ]);

    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->getKey())->sole();

    expect($branch->city_id)->toBe('EG0204')
        ->and($branch->latitude)->toBe(GeoCity::query()->findOrFail('EG0204')->lat);
});

test('submit rejects a city that does not belong to the governorate', function () {
    $owner = locationOwner();
    $tenant = $owner->tenants()->first();

    submitServiceAnswers($tenant, $owner, ['governorate_id' => 'EG01', 'city_id' => 'EG0204']);
})->throws(DomainException::class, 'Invalid location.');

test('submit rejects an unknown city', function () {
    $owner = locationOwner();
    $tenant = $owner->tenants()->first();

    submitServiceAnswers($tenant, $owner, ['city_id' => 'EG9999']);
})->throws(DomainException::class, 'Invalid location.');

test('the map is the first step for every salon and only physical salons are asked for an address', function () {
    ipIsIn(null);

    [$wizard] = openWizard();

    $wizard->assertSeeHtml('x-ref="map"')
        ->assertSeeHtml('useMyLocation()')
        ->set('data.service_location_type', ['mobile'])
        ->assertSeeHtml('x-ref="map"')
        ->assertDontSeeHtml('data.address')
        ->set('data.service_location_type', ['physical'])
        ->assertSeeHtml('data.address');
});
