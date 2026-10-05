<?php

declare(strict_types=1);

use App\Modules\V1\Auth\Filament\Pages\Register;
use App\Modules\V1\Onboarding\Filament\Pages\Onboarding;
use App\Modules\V1\Onboarding\Filament\Pages\OnboardingStatus;
use App\Modules\V1\Onboarding\Services\OnboardingService;
use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Auth\Support\RoleCatalog;
use Bltdreeg\Core\Modules\Catalog\Support\Catalog;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Onboarding\Notifications\OnboardingSubmitted;
use Bltdreeg\Core\Modules\Onboarding\Support\LegalTerms;
use Bltdreeg\Core\Modules\Onboarding\Support\SalonRegistrationService;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantSeeder;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantSlug;
use DomainException;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake(TenantLegalDocument::DISK);
    Notification::fake();
});

function registerSalon(array $overrides = []): User
{
    return app(SalonRegistrationService::class)->register([
        'salon_name' => 'Glow Studio',
        'slug' => 'glow',
        'owner_name' => 'Nour',
        'email' => 'nour@glow.test',
        'phone' => '01000000001',
        'password' => 'secret-password',
        ...$overrides,
    ]);
}

/**
 * @return array<string, mixed>
 */
function wizardAnswers(array $overrides = []): array
{
    return [
        'business_name' => 'Glow Studio',
        'website' => 'https://glow.test',
        'team_size' => TeamSizeEnum::SMALL->value,
        'service_location_type' => ['physical'],
        'address' => '10 Tahrir Square, Cairo',
        'latitude' => '30.0444',
        'longitude' => '31.2357',
        'document_type' => 'national_id',
        ...$overrides,
    ];
}

function submitOnboarding(Tenant $tenant, User $owner, array $overrides = [], ?string $path = 'tenants/x/id.jpg'): TenantOnboardingSubmission
{
    if ($path !== null) {
        Storage::disk(TenantLegalDocument::DISK)->put($path, 'fake-image');
    }

    return app(OnboardingService::class)->submit($tenant->fresh(), $owner, wizardAnswers($overrides), $path, $path ? 'id.jpg' : null);
}

function reviewer(): User
{
    return User::factory()->superAdmin()->create();
}

/**
 * Review lives in central-app; tenant tests only need the resulting state transitions.
 */
function markDeclined(TenantOnboardingSubmission $submission, User $reviewer, string $reason): void
{
    $reason = trim($reason);

    if ($reason === '') {
        throw new DomainException('A decline reason is required.');
    }

    $submission->forceFill([
        'status' => SubmissionStatusEnum::DECLINED,
        'reviewed_by_user_id' => $reviewer->getKey(),
        'reviewed_at' => now(),
        'decline_reason' => $reason,
    ])->save();

    Tenant::query()
        ->whereKey($submission->tenant_id)
        ->update(['status' => TenantStatusEnum::DECLINED->value]);
}

function markApproved(TenantOnboardingSubmission $submission, User $reviewer): void
{
    $submission->forceFill([
        'status' => SubmissionStatusEnum::APPROVED,
        'reviewed_by_user_id' => $reviewer->getKey(),
        'reviewed_at' => now(),
        'decline_reason' => null,
    ])->save();

    $submission->legalDocument()?->forceFill([
        'status' => SubmissionStatusEnum::APPROVED,
        'rejection_reason' => null,
    ])->save();

    $tenant = Tenant::query()->findOrFail($submission->tenant_id);
    $tenant->forceFill([
        'status' => TenantStatusEnum::APPROVED,
        'is_active' => true,
        'onboarding_completed_at' => now(),
    ])->save();

    app(TenantSeeder::class)->seed($tenant);
}

// Registration -------------------------------------------------------------

it('registers a draft, inactive salon with an owner and stamps terms acceptance', function () {
    Livewire::test(Register::class)
        ->set('data', [
            'salon_name' => 'Glow Studio',
            'owner_name' => 'Nour',
            'email' => 'nour@glow.test',
            'phone' => '01000000001',
            'password' => 'Secret-password-1',
            'passwordConfirmation' => 'Secret-password-1',
            'accept_terms' => true,
        ])
        ->call('register')
        ->assertHasNoFormErrors()
        ->assertRedirect('/glow-studio/onboarding');

    $tenant = Tenant::query()->where('slug', 'glow-studio')->firstOrFail();
    $owner = User::query()->where('email', 'nour@glow.test')->firstOrFail();

    expect($tenant->status)->toBe(TenantStatusEnum::DRAFT)
        ->and($tenant->name)->toBe('Glow Studio')
        ->and($tenant->is_active)->toBeFalse()
        ->and($tenant->terms_accepted_at)->not->toBeNull()
        ->and($tenant->privacy_accepted_at)->not->toBeNull()
        ->and($tenant->terms_version)->toBe(LegalTerms::VERSION)
        ->and($owner->belongsToTenant($tenant))->toBeTrue()
        ->and($owner->hasRole(config('filament-shield.super_admin.name', 'owner')))->toBeTrue()
        ->and(auth()->id())->toBe($owner->id)
        ->and(Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->exists())->toBeFalse();
});

it('ignores a stale intended URL after registration', function () {
    session(['url.intended' => url('/bloom/attendance')]);

    Livewire::test(Register::class)
        ->set('data', [
            'salon_name' => 'Fresh Salon',
            'owner_name' => 'Sara',
            'email' => 'sara@fresh.test',
            'phone' => '01000000099',
            'password' => 'Secret-password-1',
            'passwordConfirmation' => 'Secret-password-1',
            'accept_terms' => true,
        ])
        ->call('register')
        ->assertHasNoFormErrors()
        ->assertRedirect('/fresh-salon/onboarding')
        ->assertSessionMissing('url.intended');
});

it('refuses registration without accepting the terms', function () {
    Livewire::test(Register::class)
        ->set('data', [
            'salon_name' => 'Glow Studio',
            'owner_name' => 'Nour',
            'email' => 'nour@glow.test',
            'phone' => '01000000001',
            'password' => 'Secret-password-1',
            'passwordConfirmation' => 'Secret-password-1',
            'accept_terms' => false,
        ])
        ->call('register')
        ->assertHasFormErrors(['accept_terms']);

    expect(Tenant::query()->where('slug', 'glow-studio')->exists())->toBeFalse();
});

it('auto-slugifies the salon name and avoids collisions', function () {
    Tenant::factory()->create(['slug' => 'glow-studio']);

    Livewire::test(Register::class)
        ->set('data', [
            'salon_name' => 'Glow Studio',
            'owner_name' => 'Nour',
            'email' => 'nour@glow.test',
            'phone' => '01000000001',
            'password' => 'Secret-password-1',
            'passwordConfirmation' => 'Secret-password-1',
            'accept_terms' => true,
        ])
        ->call('register')
        ->assertHasNoFormErrors()
        ->assertRedirect('/glow-studio-2/onboarding');

    expect(Tenant::query()->where('slug', 'glow-studio-2')->exists())->toBeTrue();
});

it('slugifies english and arabic business names', function () {
    Tenant::factory()->create(['slug' => 'bloom']);
    Tenant::factory()->create(['slug' => 'مركز-المحله-الكبرى']);

    expect(TenantSlug::slugify('Glow Studio'))->toBe('glow-studio')
        ->and(TenantSlug::slugify('مركز المحله الكبرى'))->toBe('مركز-المحله-الكبرى')
        ->and(TenantSlug::slugify('Bloom — Downtown!!!'))->toBe('bloom-downtown')
        ->and(TenantSlug::generate('Bloom'))->toBe('bloom-2')
        ->and(TenantSlug::generate('login'))->toBe('login-salon')
        ->and(TenantSlug::generate('!!!'))->toBe('salon')
        ->and(TenantSlug::generate('مركز المحله الكبرى'))->toBe('مركز-المحله-الكبرى-2');
});

it('registers an arabic salon name into a unicode slug', function () {
    Livewire::test(Register::class)
        ->set('data', [
            'salon_name' => 'مركز المحله الكبرى',
            'owner_name' => 'نور',
            'email' => 'arabic-slug@test.dev',
            'phone' => '01099998888',
            'password' => 'Secret-password-1',
            'passwordConfirmation' => 'Secret-password-1',
            'accept_terms' => true,
        ])
        ->call('register')
        ->assertHasNoFormErrors()
        ->assertRedirect(Onboarding::getUrl(
            tenant: Tenant::query()->where('slug', 'مركز-المحله-الكبرى')->firstOrFail(),
        ));

    expect(Tenant::query()->where('slug', 'مركز-المحله-الكبرى')->value('name'))
        ->toBe('مركز المحله الكبرى');
});

// Gating -------------------------------------------------------------------

it('sends a draft salon owner to the wizard from any panel page', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();

    $this->actingAs($owner)->get('/'.$tenant->slug)->assertRedirect('/'.$tenant->slug.'/onboarding');
    $this->actingAs($owner)->get('/'.$tenant->slug.'/employees')->assertRedirect('/'.$tenant->slug.'/onboarding');
    $this->actingAs($owner)->get('/'.$tenant->slug.'/onboarding-status')->assertRedirect('/'.$tenant->slug.'/onboarding');
    $this->actingAs($owner)->get('/'.$tenant->slug.'/onboarding')->assertOk();
});

it('keeps a pending salon on the read-only status page', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();
    submitOnboarding($tenant, $owner);

    $this->actingAs($owner)->get('/'.$tenant->slug)->assertRedirect('/'.$tenant->slug.'/onboarding-status');
    $this->actingAs($owner)->get('/'.$tenant->slug.'/onboarding')->assertRedirect('/'.$tenant->slug.'/onboarding-status');
    $this->actingAs($owner)->get('/'.$tenant->slug.'/onboarding-status')
        ->assertOk()
        ->assertSee('fi-onboarding-navbar', false)
        ->assertSee('fi-onboarding-locale-btn', false)
        ->assertSee(__('core::onboarding.status_page.pending_heading'))
        ->assertSee(__('core::onboarding.status_page.browse_marketplace'))
        ->assertSee(LegalTerms::homeUrl(), false)
        ->assertDontSee('language-switch', false);
});

it('shows a declined salon the reason and lets it reopen the wizard', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();
    $submission = submitOnboarding($tenant, $owner);
    markDeclined($submission, reviewer(), 'The ID photo is blurry.');

    $this->actingAs($owner)->get('/'.$tenant->slug)->assertRedirect('/'.$tenant->slug.'/onboarding-status');
    $this->actingAs($owner)->get('/'.$tenant->slug.'/onboarding-status')
        ->assertOk()
        ->assertSee('The ID photo is blurry.');
    $this->actingAs($owner)->get('/'.$tenant->slug.'/onboarding')->assertOk();
});

it('lets an approved salon into the normal panel', function () {
    $tenant = Tenant::factory()->create();
    Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create();
    $user->tenants()->attach($tenant);

    $this->actingAs($user)->get('/'.$tenant->slug)->assertOk();
    $this->actingAs($user)->get('/'.$tenant->slug.'/onboarding')->assertRedirect('/'.$tenant->slug);
});

// Wizard -------------------------------------------------------------------

it('persists wizard answers to the tenant, first branch, document and a submission', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();
    $admin = reviewer();

    $this->actingAs($owner);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);
    app(TenantContext::class)->set($tenant);

    $component = Livewire::test(Onboarding::class);

    foreach (wizardAnswers(['business_name' => 'Glow Beauty Lounge']) as $key => $value) {
        $component->set('data.'.$key, $value);
    }

    $component
        ->set('data.document_file', UploadedFile::fake()->image('national-id.jpg'))
        ->call('submit')
        ->assertHasNoFormErrors()
        ->assertRedirect(OnboardingStatus::getUrl(tenant: $tenant));

    $tenant->refresh();
    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->sole();
    $submission = TenantOnboardingSubmission::query()->where('tenant_id', $tenant->id)->sole();
    $document = TenantLegalDocument::query()->where('tenant_id', $tenant->id)->sole();

    expect($tenant->status)->toBe(TenantStatusEnum::PENDING_REVIEW)
        ->and($tenant->name)->toBe('Glow Beauty Lounge')
        ->and($tenant->website)->toBe('https://glow.test')
        ->and($branch->getTranslation('name', 'ar'))->toBe('Glow Beauty Lounge')
        ->and($branch->getTranslation('name', 'en'))->toBe('Glow Beauty Lounge')
        ->and($branch->getTranslation('address', 'en'))->toBe('10 Tahrir Square, Cairo')
        ->and($branch->team_size)->toBe(TeamSizeEnum::SMALL)
        ->and($branch->service_location_type)->toBe(['physical'])
        ->and((float) $branch->latitude)->toBe(30.0444)
        ->and($submission->revision)->toBe(1)
        ->and($submission->status)->toBe(SubmissionStatusEnum::PENDING)
        ->and($submission->payload['document_id'])->toBe($document->id)
        ->and($document->submission_id)->toBe($submission->id)
        ->and($document->original_filename)->toBe('national-id.jpg');

    Storage::disk(TenantLegalDocument::DISK)->assertExists($document->file_path);
    expect($document->file_path)->toStartWith('tenants/'.$tenant->id.'/');

    Notification::assertSentTo($admin, OnboardingSubmitted::class);
});

it('requires an identity document on the first attempt', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();

    $this->actingAs($owner);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);

    $component = Livewire::test(Onboarding::class);

    foreach (wizardAnswers() as $key => $value) {
        $component->set('data.'.$key, $value);
    }

    $component
        ->call('submit')
        ->assertHasFormErrors(['document_file']);

    expect(TenantOnboardingSubmission::query()->withoutGlobalScopes()->count())->toBe(0);
});

it('does not require an address for mobile salons', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();

    submitOnboarding($tenant, $owner, ['service_location_type' => ['mobile'], 'address' => null, 'latitude' => null, 'longitude' => null]);

    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->sole();

    expect(blank($branch->getTranslation('address', 'en', false)))->toBeTrue()
        // لا عنوان للفرع المتنقل، لكن الأعمدة NOT NULL فبياخد مركز المنطقة الافتراضية
        ->and($branch->area_id)->toBe('EG011103')
        ->and($branch->latitude)->toBe(30.042);
});

it('refuses a second submission while one is pending', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();
    submitOnboarding($tenant, $owner);

    expect(fn () => submitOnboarding($tenant, $owner))->toThrow(DomainException::class);
});

// Decline -> resubmit ------------------------------------------------------

it('keeps every revision when a declined salon resubmits', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();
    $first = submitOnboarding($tenant, $owner);

    markDeclined($first, reviewer(), 'Website is unreachable.');

    expect($tenant->fresh()->status)->toBe(TenantStatusEnum::DECLINED)
        ->and(app(OnboardingService::class)->prefill($tenant->fresh())['website'])->toBe('https://glow.test');

    $second = submitOnboarding($tenant, $owner, ['website' => 'https://glow.example'], path: null);

    $first->refresh();

    expect($second->revision)->toBe(2)
        ->and($second->status)->toBe(SubmissionStatusEnum::PENDING)
        ->and($second->previousRevision()?->is($first))->toBeTrue()
        ->and($first->status)->toBe(SubmissionStatusEnum::DECLINED)
        ->and($first->decline_reason)->toBe('Website is unreachable.')
        ->and($first->payload['website'])->toBe('https://glow.test')
        ->and($second->payload['website'])->toBe('https://glow.example')
        ->and($second->payload['document_id'])->toBe($first->payload['document_id'])
        ->and(TenantLegalDocument::query()->withoutGlobalScopes()->count())->toBe(1)
        ->and(Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())->toBe(1)
        ->and($tenant->fresh()->status)->toBe(TenantStatusEnum::PENDING_REVIEW);
});

// Approval seeding ---------------------------------------------------------

it('approves a salon, makes it visible and seeds starter data including عاطف', function () {
    Catalog::seed();
    RoleCatalog::seed();

    $owner = registerSalon();
    $tenant = $owner->tenants()->first();
    $submission = submitOnboarding($tenant, $owner);

    expect(Service::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->exists())->toBeFalse();

    markApproved($submission, reviewer());
    // Approving twice must not duplicate anything.
    app(TenantSeeder::class)->seed($tenant->fresh());

    $tenant->refresh();
    $branch = Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->sole();
    $atef = User::query()->where('name', 'عاطف')->sole();
    $pivot = $atef->tenants()->whereKey($tenant->id)->first()->pivot;

    expect($tenant->status)->toBe(TenantStatusEnum::APPROVED)
        ->and($tenant->is_active)->toBeTrue()
        ->and($tenant->isVisibleOnMarketplace())->toBeTrue()
        ->and(Tenant::query()->visibleOnMarketplace()->whereKey($tenant->id)->exists())->toBeTrue()
        ->and($submission->fresh()->status)->toBe(SubmissionStatusEnum::APPROVED)
        ->and(Service::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())->toBeGreaterThan(0)
        ->and(Role::forTenant($tenant)->pluck('name')->all())->toContain('Salon manager', 'Receptionist')
        ->and($atef->branch_id)->toBe($branch->id)
        ->and($atef->start_date)->not->toBeNull()
        ->and((float) $atef->salary)->toBeGreaterThan(0)
        ->and(JobType::query()->withoutGlobalScopes()->find($pivot->job_type_id)?->name)->toBe(TenantSeeder::BARBER_JOB_TYPE)
        ->and($pivot->shift_id)->not->toBeNull()
        ->and(User::query()->where('name', 'عاطف')->count())->toBe(1);
});

it('keeps a pending or inactive salon off the marketplace', function () {
    $owner = registerSalon();
    $tenant = $owner->tenants()->first();
    submitOnboarding($tenant, $owner);

    $approvedButDisabled = Tenant::factory()->create(['is_active' => false]);

    expect(Tenant::query()->visibleOnMarketplace()->pluck('id')->all())
        ->not->toContain($tenant->id, $approvedButDisabled->id);
});

// Isolation & document privacy --------------------------------------------

it('scopes submissions and documents to the current tenant', function () {
    $ownerA = registerSalon();
    $ownerB = registerSalon(['slug' => 'other', 'email' => 'b@other.test', 'phone' => '01000000002']);
    $tenantA = $ownerA->tenants()->first();
    $tenantB = $ownerB->tenants()->first();

    submitOnboarding($tenantA, $ownerA, path: 'tenants/a/id.jpg');
    submitOnboarding($tenantB, $ownerB, path: 'tenants/b/id.jpg');

    app(TenantContext::class)->set($tenantA);

    expect(TenantOnboardingSubmission::query()->pluck('tenant_id')->unique()->all())->toBe([$tenantA->id])
        ->and(TenantLegalDocument::query()->pluck('tenant_id')->unique()->all())->toBe([$tenantA->id]);
});

it('stores identity documents on a private disk that is not web reachable', function () {
    $disk = config('filesystems.disks.'.TenantLegalDocument::DISK);

    expect($disk['visibility'])->toBe('private')
        ->and($disk['serve'])->toBeFalse()
        ->and($disk['root'])->not->toContain(public_path())
        ->and($disk['root'])->not->toContain(storage_path('app/public'));

    $owner = registerSalon();
    submitOnboarding($owner->tenants()->first(), $owner, path: 'tenants/1/id.jpg');

    expect($this->get('/storage/tenants/1/id.jpg')->status())->toBeIn([403, 404]);
    expect((new TenantLegalDocument)->getHidden())->toContain('file_path');
});
