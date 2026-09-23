<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Onboarding\Policies;


use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Illuminate\Foundation\Auth\User as AuthUser;

/**
 * Identity documents are only ever viewed by platform reviewers, never by salon staff.
 */
class TenantLegalDocumentPolicy
{
    public function view(AuthUser $authUser, TenantLegalDocument $document): bool
    {
        return $authUser->can('View:TenantOnboardingSubmission');
    }
}
