<?php

declare(strict_types=1);

namespace App\Modules\V1\Onboarding\Services;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Bltdreeg\Core\Modules\Onboarding\Enums\LegalDocumentTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\ServiceLocationTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Onboarding\Notifications\OnboardingSubmitted;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/**
 * Salon-side onboarding: wizard submit / prefill. Review (approve/decline) lives in central-app.
 */
class OnboardingService
{
    /**
     * Keys stored in the submission payload, in wizard order.
     *
     * @var list<string>
     */
    public const PAYLOAD_KEYS = [
        'business_name',
        'website',
        'team_size',
        'service_location_type',
        'address',
        'latitude',
        'longitude',
        'document_type',
        'document_id',
    ];

    public function canSubmit(Tenant $tenant): bool
    {
        return in_array($tenant->status, [TenantStatusEnum::DRAFT, TenantStatusEnum::DECLINED], true);
    }

    /**
     * Wizard answers from the most recent attempt, used to prefill a resubmission.
     *
     * @return array<string, mixed>
     */
    public function prefill(Tenant $tenant): array
    {
        $latest = TenantOnboardingSubmission::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenant->getKey())
            ->orderByDesc('revision')
            ->first();

        $payload = $latest?->payload ?? [
            'business_name' => $tenant->name,
            'website' => $tenant->website,
        ];

        if (array_key_exists('service_location_type', $payload)) {
            $payload['service_location_type'] = ServiceLocationTypeEnum::normalize($payload['service_location_type']);
        }

        return $payload;
    }

    public function latestDocument(Tenant $tenant): ?TenantLegalDocument
    {
        return TenantLegalDocument::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenant->getKey())
            ->latest('id')
            ->first();
    }

    /**
     * @param  array{business_name: string, website?: ?string, team_size: string, service_location_type: list<string>|string, address?: ?string, latitude?: mixed, longitude?: mixed, document_type: string}  $answers
     * @param  string|null  $documentPath  Path on the identity_documents disk; null keeps the previous document.
     */
    public function submit(Tenant $tenant, User $submitter, array $answers, ?string $documentPath, ?string $originalFilename = null): TenantOnboardingSubmission
    {
        $submission = DB::transaction(function () use ($tenant, $submitter, $answers, $documentPath, $originalFilename): TenantOnboardingSubmission {
            $tenant = Tenant::query()->lockForUpdate()->findOrFail($tenant->getKey());

            if (! $this->canSubmit($tenant)) {
                throw new DomainException('This salon has already been submitted for review.');
            }

            $teamSize = TeamSizeEnum::from($answers['team_size']);
            $locationTypes = ServiceLocationTypeEnum::normalize($answers['service_location_type'] ?? []);

            if ($locationTypes === []) {
                throw new DomainException('At least one service location is required.');
            }

            $documentType = LegalDocumentTypeEnum::from($answers['document_type']);
            $needsAddress = ServiceLocationTypeEnum::selectionRequiresAddress($locationTypes);
            $address = $needsAddress ? trim((string) ($answers['address'] ?? '')) : null;

            $tenant->forceFill([
                'name' => $answers['business_name'],
                'website' => $answers['website'] ?? null,
                'address' => $address ?? '',
            ])->save();

            $this->saveFirstBranch($tenant, $answers, $teamSize, $locationTypes, $address, $needsAddress);

            $document = $this->resolveDocument($tenant, $documentType, $documentPath, $originalFilename);

            $revision = (int) TenantOnboardingSubmission::query()
                ->withoutGlobalScopes()
                ->where('tenant_id', $tenant->getKey())
                ->max('revision') + 1;

            $submission = TenantOnboardingSubmission::query()->create([
                'tenant_id' => $tenant->getKey(),
                'submitted_by_user_id' => $submitter->getKey(),
                'payload' => [
                    'business_name' => $answers['business_name'],
                    'website' => $answers['website'] ?? null,
                    'team_size' => $teamSize->value,
                    'service_location_type' => $locationTypes,
                    'address' => $address,
                    'latitude' => $needsAddress ? ($answers['latitude'] ?? null) : null,
                    'longitude' => $needsAddress ? ($answers['longitude'] ?? null) : null,
                    'document_type' => $document->type->value,
                    'document_id' => $document->getKey(),
                ],
                'status' => SubmissionStatusEnum::PENDING,
                'revision' => $revision,
            ]);

            if ($document->submission_id === null) {
                $document->forceFill(['submission_id' => $submission->getKey()])->save();
            }

            $tenant->forceFill(['status' => TenantStatusEnum::PENDING_REVIEW])->save();

            return $submission;
        });

        Notification::send(
            User::query()->where('is_super_admin', true)->where('is_active', true)->get(),
            new OnboardingSubmitted($submission),
        );

        return $submission;
    }

    /**
     * @param  array<string, mixed>  $answers
     * @param  list<string>  $locationTypes
     */
    private function saveFirstBranch(Tenant $tenant, array $answers, TeamSizeEnum $teamSize, array $locationTypes, ?string $address, bool $needsAddress): Branch
    {
        $branch = Branch::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenant->getKey())
            ->orderBy('id')
            ->first() ?? new Branch(['tenant_id' => $tenant->getKey(), 'is_active' => true]);

        $lat = $answers['latitude'] ?? null;
        $lng = $answers['longitude'] ?? null;
        $resolver = app(LocationResolver::class);

        // مؤقتاً لحد ما خطوة الموقع الجديدة في الـ wizard: نقطة مصرية صالحة، أو الموقع الحالي للفرع، أو القاهرة الافتراضية
        $location = $needsAddress && is_numeric($lat) && is_numeric($lng) && EgyptBounds::contains((float) $lat, (float) $lng)
            ? $resolver->nearest((float) $lat, (float) $lng, LocationSourceEnum::Manual)
            : ($branch->exists ? null : $resolver->fallback()->withSource(LocationSourceEnum::Manual));

        $branch->fill([
            'name' => ['ar' => $answers['business_name'], 'en' => $answers['business_name']],
            'phone' => $branch->phone ?? $tenant->phone,
            'address' => $address === null ? null : ['ar' => $address, 'en' => $address],
            ...($location?->toBranchColumns() ?? []),
            'team_size' => $teamSize,
            'service_location_type' => $locationTypes,
        ]);
        $branch->tenant_id = $tenant->getKey();
        $branch->save();

        return $branch;
    }

    private function resolveDocument(Tenant $tenant, LegalDocumentTypeEnum $type, ?string $documentPath, ?string $originalFilename): TenantLegalDocument
    {
        if ($documentPath !== null) {
            return TenantLegalDocument::query()->create([
                'tenant_id' => $tenant->getKey(),
                'type' => $type,
                'file_path' => $documentPath,
                'original_filename' => $originalFilename,
                'status' => SubmissionStatusEnum::PENDING,
            ]);
        }

        $previous = $this->latestDocument($tenant);

        if (! $previous) {
            throw new DomainException('An identity document is required.');
        }

        return $previous;
    }
}
