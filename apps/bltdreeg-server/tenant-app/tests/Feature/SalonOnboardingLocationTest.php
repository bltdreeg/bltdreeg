<?php

declare(strict_types=1);

use App\Modules\V1\Onboarding\Filament\Pages\Onboarding;
use App\Modules\V1\Onboarding\Filament\Pages\OnboardingStatus;
use App\Modules\V1\Onboarding\Services\OnboardingService;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
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
        'area_id' => 'EG011103',
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
        ->assertSet('data.area_id', 'EG020405')
        ->assertSet('data.location_source', 'ip');
});

test('mount falls back to the default area when the ip is unknown', function () {
    ipIsIn(null);

    [$wizard] = openWizard();

    $wizard->assertSet('data.area_id', 'EG011103')
        ->assertSet('data.location_source', 'default');
});

test('moving the pin resolves the dropdowns and keeps the exact point', function () {
    ipIsIn(null);

    [$wizard] = openWizard();

    $wizard->call('pinMoved', 31.2001, 29.9187, 'gps')
        ->assertSet('data.area_id', 'EG020405')
        ->assertSet('data.latitude', 31.2001)
        ->assertSet('data.location_source', 'gps');
});

test('a pin outside egypt is ignored', function () {
    ipIsIn(null);

    [$wizard] = openWizard();

    $wizard->call('pinMoved', 51.5074, -0.1278, 'manual')
        ->assertSet('data.area_id', 'EG011103')
        ->assertNotified();
});

test('a pasted google maps link moves the pin', function () {
    ipIsIn(null);
    Http::preventStrayRequests();

    [$wizard] = openWizard();

    $wizard->set('data.maps_url', 'https://www.google.com/maps/place/X/@31.19,29.90,17z/data=!3d31.2001!4d29.9187')
        ->call('applyMapsUrl')
        ->assertHasNoErrors()
        ->assertSet('data.area_id', 'EG020405')
        ->assertSet('data.location_source', 'maps_url');
});

test('an unreadable maps link shows an error and changes nothing', function () {
    ipIsIn(null);
    Http::preventStrayRequests();

    [$wizard] = openWizard();

    $wizard->set('data.maps_url', 'https://evil.example.com/@31.2,29.9,15z')
        ->call('applyMapsUrl')
        ->assertHasErrors(['data.maps_url'])
        ->assertSet('data.area_id', 'EG011103');
});

test('choosing an area in another city moves the pin to its centroid', function () {
    ipIsIn(null);
    $area = GeoArea::query()->findOrFail('EG020405');

    [$wizard] = openWizard();

    $wizard->call('areaChosen', 'EG020405')
        ->assertSet('data.city_id', 'EG0204')
        ->assertSet('data.governorate_id', 'EG02')
        ->assertSet('data.latitude', $area->lat)
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

    expect($branch->area_id)->toBe('EG011103')
        ->and($branch->city_id)->toBe('EG0111')
        ->and($branch->governorate_id)->toBe('EG01')
        ->and($branch->latitude)->toBeFloat();
});

test('mobile-only salons keep the area they picked from the dropdowns', function () {
    $owner = locationOwner();
    $tenant = $owner->tenants()->first();

    submitServiceAnswers($tenant, $owner, [
        'service_location_type' => ['mobile'],
        'address' => null,
        'latitude' => null,
        'longitude' => null,
        'area_id' => 'EG020405',
        'city_id' => 'EG0204',
        'governorate_id' => 'EG02',
    ]);

    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->getKey())->sole();

    expect($branch->area_id)->toBe('EG020405')
        ->and($branch->latitude)->toBe(GeoArea::query()->findOrFail('EG020405')->lat);
});

test('submit rejects an area that does not belong to the city', function () {
    $owner = locationOwner();
    $tenant = $owner->tenants()->first();

    submitServiceAnswers($tenant, $owner, ['governorate_id' => 'EG01', 'city_id' => 'EG0111', 'area_id' => 'EG020405']);
})->throws(DomainException::class, 'Invalid location.');

test('submit rejects an unknown area', function () {
    $owner = locationOwner();
    $tenant = $owner->tenants()->first();

    submitServiceAnswers($tenant, $owner, ['area_id' => 'EG999999']);
})->throws(DomainException::class, 'Invalid location.');

test('physical salons see the map and mobile-only salons do not', function () {
    ipIsIn(null);

    [$wizard] = openWizard();

    $wizard->set('data.service_location_type', ['physical'])
        ->assertSeeHtml('x-ref="map"')
        ->set('data.service_location_type', ['mobile'])
        ->assertDontSeeHtml('x-ref="map"');
});
