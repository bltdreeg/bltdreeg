<?php

use App\Modules\V1\Auth\AuthServiceProvider;
use App\Modules\V1\Branches\BranchesServiceProvider;
use App\Modules\V1\Hr\HrServiceProvider;
use App\Modules\V1\Onboarding\OnboardingServiceProvider;
use App\Modules\V1\Roles\RolesServiceProvider;
use App\Modules\V1\Services\ServicesServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\Filament\AppPanelProvider;

return [
    AppServiceProvider::class,
    AppPanelProvider::class,
    AuthServiceProvider::class,
    BranchesServiceProvider::class,
    HrServiceProvider::class,
    OnboardingServiceProvider::class,
    RolesServiceProvider::class,
    ServicesServiceProvider::class,
];
