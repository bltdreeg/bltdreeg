<?php

use App\Modules\V1\Branches\BranchesServiceProvider;
use App\Modules\V1\Catalog\CatalogServiceProvider;
use App\Modules\V1\Customer\CustomerServiceProvider;
use App\Modules\V1\Onboarding\OnboardingServiceProvider;
use App\Modules\V1\Shared\SharedServiceProvider;
use App\Modules\V1\Tenants\TenantsServiceProvider;
use App\Modules\V1\Users\UsersServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\Filament\AdminPanelProvider;

return [
    AppServiceProvider::class,
    AdminPanelProvider::class,
    SharedServiceProvider::class,
    BranchesServiceProvider::class,
    CatalogServiceProvider::class,
    OnboardingServiceProvider::class,
    TenantsServiceProvider::class,
    UsersServiceProvider::class,
    CustomerServiceProvider::class,
];
