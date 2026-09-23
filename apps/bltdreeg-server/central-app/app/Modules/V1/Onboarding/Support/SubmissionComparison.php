<?php

namespace App\Modules\V1\Onboarding\Support;

use Bltdreeg\Core\Modules\Onboarding\Enums\LegalDocumentTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\ServiceLocationTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;

/**
 * Human-readable, field-by-field view of a submission against the revision before it.
 */
class SubmissionComparison
{
    /**
     * @return list<array{label: string, previous: ?string, current: ?string, changed: bool}>
     */
    public static function rows(TenantOnboardingSubmission $submission): array
    {
        $previous = $submission->previousRevision();

        $rows = [];

        foreach (self::fields() as $key => $label) {
            $current = self::present($key, $submission->payload[$key] ?? null);
            $before = $previous ? self::present($key, $previous->payload[$key] ?? null) : null;

            $rows[] = [
                'label' => $label,
                'previous' => $before,
                'current' => $current,
                'changed' => $previous !== null && $before !== $current,
            ];
        }

        return $rows;
    }

    /**
     * @return array<string, string>
     */
    private static function fields(): array
    {
        return [
            'business_name' => __('core::onboarding.wizard.business_name'),
            'website' => __('core::onboarding.wizard.website'),
            'team_size' => __('core::onboarding.wizard.steps.team'),
            'service_location_type' => __('core::onboarding.wizard.steps.location_type'),
            'address' => __('core::onboarding.wizard.address'),
            'latitude' => __('core::onboarding.wizard.latitude'),
            'longitude' => __('core::onboarding.wizard.longitude'),
            'document_type' => __('core::onboarding.wizard.document_type'),
            'document_id' => __('core::onboarding.admin.document'),
        ];
    }

    private static function present(string $key, mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return match ($key) {
            'team_size' => TeamSizeEnum::tryFrom($value)?->label() ?? (string) $value,
            'service_location_type' => ServiceLocationTypeEnum::labels($value) ?: (is_string($value) ? $value : null),
            'document_type' => LegalDocumentTypeEnum::tryFrom($value)?->label() ?? (string) $value,
            'document_id' => '#'.$value,
            default => (string) $value,
        };
    }
}
