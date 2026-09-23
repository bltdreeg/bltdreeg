<?php

declare(strict_types=1);

namespace App\Modules\V1\Onboarding;

use App\Modules\V1\Shared\Support\PrivateFileRegistry;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Illuminate\Support\ServiceProvider;

class OnboardingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        PrivateFileRegistry::register(
            TenantLegalDocument::PRIVATE_FILE_TYPE,
            TenantLegalDocument::class,
        );
    }

    public function boot(): void
    {
        //
    }
}
