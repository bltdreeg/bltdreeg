<?php

declare(strict_types=1);

use App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\OnboardingSubmissionResource;
use App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Pages\ViewOnboardingSubmission;
use App\Modules\V1\Onboarding\Services\OnboardingReviewService;
use App\Modules\V1\Shared\Http\Controllers\PrivateFileController;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Auth\Support\RoleCatalog;
use Bltdreeg\Core\Modules\Catalog\Support\Catalog;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Bltdreeg\Core\Modules\Onboarding\Enums\LegalDocumentTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Onboarding\Notifications\OnboardingApproved;
use Bltdreeg\Core\Modules\Onboarding\Notifications\OnboardingDeclined;
use Bltdreeg\Core\Modules\Onboarding\Support\SalonRegistrationService;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use DomainException;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake(TenantLegalDocument::DISK);
    Notification::fake();
    Filament::setCurrentPanel('admin');
});

/**
 * Central cannot call tenant OnboardingService::submit — build a pending revision in place.
 *
 * @return array{0: Tenant, 1: User, 2: TenantOnboardingSubmission}
 */
function pendingSalon(string $website = 'https://glow.test'): array
{
    $owner = app(SalonRegistrationService::class)->register([
        'salon_name' => 'Glow Studio',
        'slug' => 'glow',
        'owner_name' => 'Nour',
        'email' => 'nour@glow.test',
        'phone' => '01000000001',
        'password' => 'secret-password',
    ]);
    $tenant = $owner->tenants()->first();
    $path = 'tenants/'.$tenant->id.'/id.jpg';

    Storage::disk(TenantLegalDocument::DISK)->put($path, 'fake-image-bytes');

    $tenant->forceFill([
        'name' => 'Glow Studio',
        'website' => $website,
        'address' => '10 Tahrir Square, Cairo',
        'status' => TenantStatusEnum::PENDING_REVIEW,
    ])->save();

    $branch = Branch::query()
        ->withoutGlobalScopes()
        ->where('tenant_id', $tenant->id)
        ->orderBy('id')
        ->first() ?? new Branch(['tenant_id' => $tenant->id, 'is_active' => true]);

    $branch->forceFill([
        ...app(LocationResolver::class)->fallback()->withSource(LocationSourceEnum::Manual)->toBranchColumns(),
        'name' => ['ar' => 'Glow Studio', 'en' => 'Glow Studio'],
        'phone' => $tenant->phone,
        'address' => ['ar' => '10 Tahrir Square, Cairo', 'en' => '10 Tahrir Square, Cairo'],
        'latitude' => 30.0444,
        'longitude' => 31.2357,
        'team_size' => TeamSizeEnum::SMALL,
        'service_location_type' => ['physical'],
    ]);
    $branch->tenant_id = $tenant->id;
    $branch->save();

    $document = TenantLegalDocument::query()->create([
        'tenant_id' => $tenant->id,
        'type' => LegalDocumentTypeEnum::NATIONAL_ID,
        'file_path' => $path,
        'original_filename' => 'id.jpg',
        'status' => SubmissionStatusEnum::PENDING,
    ]);

    $submission = TenantOnboardingSubmission::query()->create([
        'tenant_id' => $tenant->id,
        'submitted_by_user_id' => $owner->id,
        'payload' => [
            'business_name' => 'Glow Studio',
            'website' => $website,
            'team_size' => TeamSizeEnum::SMALL->value,
            'service_location_type' => ['physical'],
            'address' => '10 Tahrir Square, Cairo',
            'latitude' => '30.0444',
            'longitude' => '31.2357',
            'document_type' => LegalDocumentTypeEnum::NATIONAL_ID->value,
            'document_id' => $document->id,
        ],
        'status' => SubmissionStatusEnum::PENDING,
        'revision' => 1,
    ]);

    $document->forceFill(['submission_id' => $submission->id])->save();

    return [$tenant->fresh(), $owner, $submission];
}

/**
 * Second revision after a decline (mirrors tenant resubmit without importing tenant services).
 */
function resubmitSalon(Tenant $tenant, User $owner, TenantOnboardingSubmission $previous, array $payloadOverrides = []): TenantOnboardingSubmission
{
    $payload = [...$previous->payload, ...$payloadOverrides];
    $revision = (int) $previous->revision + 1;

    $tenant->forceFill([
        'website' => $payload['website'] ?? $tenant->website,
        'status' => TenantStatusEnum::PENDING_REVIEW,
    ])->save();

    return TenantOnboardingSubmission::query()->create([
        'tenant_id' => $tenant->id,
        'submitted_by_user_id' => $owner->id,
        'payload' => $payload,
        'status' => SubmissionStatusEnum::PENDING,
        'revision' => $revision,
    ]);
}

test('the review queue lists pending submissions for super admins only', function () {
    [$tenant] = pendingSalon();

    $this->actingAs(User::factory()->superAdmin()->create())
        ->get(OnboardingSubmissionResource::getUrl('index'))
        ->assertOk()
        ->assertSee($tenant->name);

    $this->actingAs(User::factory()->create())
        ->get(OnboardingSubmissionResource::getUrl('index'))
        ->assertForbidden();
});

test('a resubmission shows what changed since the previous revision', function () {
    [$tenant, $owner, $first] = pendingSalon();
    $admin = User::factory()->superAdmin()->create();

    app(OnboardingReviewService::class)->decline($first, $admin, 'Website is down.');
    $second = resubmitSalon($tenant->fresh(), $owner, $first, ['website' => 'https://glow.example']);

    $this->actingAs($admin)
        ->get(OnboardingSubmissionResource::getUrl('view', ['record' => $second]))
        ->assertOk()
        ->assertSee('https://glow.test')
        ->assertSee('https://glow.example')
        ->assertSee('Website is down.');
});

test('approving makes the salon live, seeds it and notifies the owner', function () {
    Catalog::seed();
    RoleCatalog::seed();
    [$tenant, $owner, $submission] = pendingSalon();

    $this->actingAs(User::factory()->superAdmin()->create());

    Livewire::test(ViewOnboardingSubmission::class, ['record' => $submission->getRouteKey()])
        ->callAction('approve')
        ->assertHasNoActionErrors();

    $tenant->refresh();

    expect($tenant->status)->toBe(TenantStatusEnum::APPROVED)
        ->and($tenant->is_active)->toBeTrue()
        ->and($submission->fresh()->status)->toBe(SubmissionStatusEnum::APPROVED)
        ->and(Service::query()->where('tenant_id', $tenant->id)->exists())->toBeTrue()
        ->and(User::query()->where('name', 'عاطف')->exists())->toBeTrue();

    Notification::assertSentTo($owner, OnboardingApproved::class);
});

test('declining requires a reason and notifies the owner', function () {
    [$tenant, $owner, $submission] = pendingSalon();
    $admin = User::factory()->superAdmin()->create();

    $this->actingAs($admin);

    Livewire::test(ViewOnboardingSubmission::class, ['record' => $submission->getRouteKey()])
        ->callAction('decline', ['reason' => ''])
        ->assertHasActionErrors(['reason' => 'required']);

    expect($submission->fresh()->status)->toBe(SubmissionStatusEnum::PENDING);

    expect(fn () => app(OnboardingReviewService::class)->decline($submission, $admin, '   '))
        ->toThrow(DomainException::class);

    Livewire::test(ViewOnboardingSubmission::class, ['record' => $submission->getRouteKey()])
        ->mountAction('decline')
        ->set('mountedActions.0.data.reason', 'ID photo is blurry.')
        ->callMountedAction()
        ->assertHasNoActionErrors();

    expect($submission->fresh()->status)->toBe(SubmissionStatusEnum::DECLINED)
        ->and($submission->fresh()->decline_reason)->toBe('ID photo is blurry.')
        ->and($tenant->fresh()->status)->toBe(TenantStatusEnum::DECLINED)
        ->and($tenant->fresh()->is_active)->toBeFalse();

    Notification::assertSentTo($owner, OnboardingDeclined::class);
});

test('review actions disappear once a submission is reviewed', function () {
    [, , $submission] = pendingSalon();
    $admin = User::factory()->superAdmin()->create();
    app(OnboardingReviewService::class)->decline($submission, $admin, 'No.');

    $this->actingAs($admin);

    Livewire::test(ViewOnboardingSubmission::class, ['record' => $submission->getRouteKey()])
        ->assertActionHidden('approve')
        ->assertActionHidden('decline');
});

test('identity documents are only served through a signed link to reviewers', function () {
    [, $owner, $submission] = pendingSalon();
    $document = $submission->legalDocument();
    $signedUrl = PrivateFileController::temporaryUrl($document);
    $unsignedUrl = route('private-files.show', [
        'type' => $document::PRIVATE_FILE_TYPE,
        'id' => $document->id,
    ]);

    // Unsigned, even for a reviewer.
    $this->actingAs(User::factory()->superAdmin()->create())->get($unsignedUrl)->assertForbidden();

    // Signed but not a reviewer (the salon owner themself, or a guest).
    $this->actingAs($owner)->get($signedUrl)->assertForbidden();
    auth()->logout();
    $this->get($signedUrl)->assertForbidden();

    // Signed reviewer.
    $response = $this->actingAs(User::factory()->superAdmin()->create())->get($signedUrl);
    $response->assertOk();
    expect($response->streamedContent())->toBe('fake-image-bytes')
        ->and($response->headers->get('Cache-Control'))->toContain('no-store');

    // Expired.
    $this->travel(PrivateFileController::TTL_MINUTES + 1)->minutes();
    $this->get($signedUrl)->assertForbidden();
});
