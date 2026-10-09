<?php

declare(strict_types=1);

namespace App\Modules\V1\Onboarding\Services;

use App\Modules\V1\Branches\Support\BranchImages;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
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
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/**
 * Salon-side onboarding: wizard submit / prefill. Review (approve/decline) lives in central-app.
 */
class OnboardingService
{
    /**
     * Social platforms asked for in the wizard; wizard fields are `social_<platform>`.
     *
     * @var list<string>
     */
    public const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'tiktok', 'youtube', 'snapchat'];

    /**
     * Keys stored in the submission payload, in wizard order.
     *
     * @var list<string>
     */
    public const PAYLOAD_KEYS = [
        'business_name',
        'website',
        'social_facebook',
        'social_instagram',
        'social_tiktok',
        'social_youtube',
        'social_snapchat',
        'team_size',
        'service_location_type',
        'address',
        'latitude',
        'longitude',
        'governorate_id',
        'city_id',
        'location_source',
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
            ...collect(self::SOCIAL_PLATFORMS)
                ->mapWithKeys(fn (string $platform): array => ['social_'.$platform => $tenant->social_links[$platform] ?? null])
                ->all(),
        ];

        // المسودة (اللي اتحفظت مع كل "التالي") أحدث من آخر طلب اتقدّم
        $payload = [...$payload, ...($tenant->onboarding_draft ?? [])];

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
     * @param  array{business_name: string, website?: ?string, team_size: string, service_location_type: list<string>|string, address?: ?string, latitude?: mixed, longitude?: mixed, governorate_id: string, city_id: string, location_source?: ?string, document_type: string}  $answers
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
            $location = $this->resolveLocation($answers);

            $tenant->forceFill([
                'name' => $answers['business_name'],
                'website' => $answers['website'] ?? null,
                'social_links' => $this->socialLinks($answers),
                'onboarding_draft' => null,
                'address' => $address ?? '',
            ])->save();

            $this->saveFirstBranch($tenant, $answers, $teamSize, $locationTypes, $address, $location);

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
                    ...$this->socialPayload($answers),
                    'team_size' => $teamSize->value,
                    'service_location_type' => $locationTypes,
                    'address' => $address,
                    'latitude' => $location->lat,
                    'longitude' => $location->lng,
                    'governorate_id' => $location->governorateId(),
                    'city_id' => $location->cityId(),
                    'location_source' => $location->source->label(),
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
    private function saveFirstBranch(Tenant $tenant, array $answers, TeamSizeEnum $teamSize, array $locationTypes, ?string $address, ResolvedLocation $location): Branch
    {
        $branch = Branch::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenant->getKey())
            ->orderBy('id')
            ->first() ?? new Branch(['tenant_id' => $tenant->getKey(), 'is_active' => true]);

        $branch->fill([
            'name' => ['ar' => $answers['business_name'], 'en' => $answers['business_name']],
            'phone' => $branch->phone ?? $tenant->phone,
            'address' => $address === null ? null : ['ar' => $address, 'en' => $address],
            ...$location->toBranchColumns(),
            'team_size' => $teamSize,
            'service_location_type' => $locationTypes,
            ...Arr::only(BranchImages::resolve($answers), ['images', 'cover_image']),
        ]);
        $branch->tenant_id = $tenant->getKey();
        $branch->save();

        return $branch;
    }

    /**
     * The city is the source of truth: a governorate that does not match it is a tampered request,
     * and the exact point is only kept when it lies in that city.
     *
     * @param  array<string, mixed>  $answers
     */
    private function resolveLocation(array $answers): ResolvedLocation
    {
        $city = GeoCity::query()->find($answers['city_id'] ?? null);

        if ($city === null || $city->governorate_id !== ($answers['governorate_id'] ?? null)) {
            throw new DomainException('Invalid location.');
        }

        $lat = is_numeric($answers['latitude'] ?? null) ? (float) $answers['latitude'] : null;
        $lng = is_numeric($answers['longitude'] ?? null) ? (float) $answers['longitude'] : null;
        $source = LocationSourceEnum::tryFromLabel($answers['location_source'] ?? null) ?? LocationSourceEnum::Manual;

        return app(LocationResolver::class)->forCity($city->getKey(), $lat, $lng, $source);
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

    /**
     * Keeps the wizard answers between steps so a refresh does not lose them. The document upload is
     * not part of the draft: files only exist once the wizard is submitted.
     *
     * @param  array<string, mixed>  $data
     */
    public function saveDraft(Tenant $tenant, array $data): void
    {
        if (! $this->canSubmit($tenant)) {
            return;
        }

        $keys = array_diff(self::PAYLOAD_KEYS, ['document_id']);

        $tenant->forceFill(['onboarding_draft' => array_intersect_key($data, array_flip($keys))])->save();
    }

    /**
     * @param  array<string, mixed>  $answers
     * @return array<string, ?string>
     */
    private function socialPayload(array $answers): array
    {
        return collect(self::SOCIAL_PLATFORMS)
            ->mapWithKeys(fn (string $platform): array => ['social_'.$platform => filled($answers['social_'.$platform] ?? null) ? trim((string) $answers['social_'.$platform]) : null])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $answers
     * @return array<string, string>|null
     */
    private function socialLinks(array $answers): ?array
    {
        $links = [];

        foreach ($this->socialPayload($answers) as $key => $url) {
            if ($url !== null) {
                $links[substr($key, strlen('social_'))] = $url;
            }
        }

        return $links === [] ? null : $links;
    }
}
