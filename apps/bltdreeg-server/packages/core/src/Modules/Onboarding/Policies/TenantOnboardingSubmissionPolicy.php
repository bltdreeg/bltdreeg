<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Onboarding\Policies;

use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class TenantOnboardingSubmissionPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:TenantOnboardingSubmission');
    }

    public function view(AuthUser $authUser, TenantOnboardingSubmission $submission): bool
    {
        return $authUser->can('View:TenantOnboardingSubmission');
    }

    public function create(AuthUser $authUser): bool
    {
        return false;
    }

    /**
     * Approve / decline.
     */
    public function update(AuthUser $authUser, TenantOnboardingSubmission $submission): bool
    {
        return $submission->isPending() && $authUser->can('Update:TenantOnboardingSubmission');
    }

    public function delete(AuthUser $authUser, TenantOnboardingSubmission $submission): bool
    {
        return false;
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return false;
    }
}
