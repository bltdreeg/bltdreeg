<?php

declare(strict_types=1);

namespace App\Modules\V1\Onboarding\Services;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Onboarding\Notifications\OnboardingApproved;
use Bltdreeg\Core\Modules\Onboarding\Notifications\OnboardingDeclined;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantSeeder;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * Landlord-side onboarding review. Salon submit/prefill lives in tenant-app.
 */
class OnboardingReviewService
{
    public function __construct(private TenantSeeder $seeder) {}

    public function approve(TenantOnboardingSubmission $submission, User $reviewer): void
    {
        DB::transaction(function () use ($submission, $reviewer): void {
            $submission = $this->lockPending($submission);

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

            $tenant = Tenant::query()->lockForUpdate()->findOrFail($submission->tenant_id);
            $tenant->forceFill([
                'status' => TenantStatusEnum::APPROVED,
                'is_active' => true,
                'onboarding_completed_at' => now(),
            ])->save();

            $this->seeder->seed($tenant);
        });

        $this->notifySubmitter($submission, new OnboardingApproved($submission->fresh()));
    }

    public function decline(TenantOnboardingSubmission $submission, User $reviewer, string $reason): void
    {
        $reason = trim($reason);

        if ($reason === '') {
            throw new DomainException('A decline reason is required.');
        }

        DB::transaction(function () use ($submission, $reviewer, $reason): void {
            $submission = $this->lockPending($submission);

            $submission->forceFill([
                'status' => SubmissionStatusEnum::DECLINED,
                'reviewed_by_user_id' => $reviewer->getKey(),
                'reviewed_at' => now(),
                'decline_reason' => $reason,
            ])->save();

            Tenant::query()
                ->whereKey($submission->tenant_id)
                ->update(['status' => TenantStatusEnum::DECLINED->value]);
        });

        $this->notifySubmitter($submission, new OnboardingDeclined($submission->fresh()));
    }

    private function lockPending(TenantOnboardingSubmission $submission): TenantOnboardingSubmission
    {
        $locked = TenantOnboardingSubmission::query()
            ->withoutGlobalScopes()
            ->lockForUpdate()
            ->findOrFail($submission->getKey());

        if (! $locked->isPending()) {
            throw new DomainException('This submission has already been reviewed.');
        }

        return $locked;
    }

    private function notifySubmitter(TenantOnboardingSubmission $submission, object $notification): void
    {
        $submitter = $submission->submittedBy;

        if ($submitter) {
            $submitter->notify($notification);
        }
    }
}
