<?php

use App\Modules\V1\ApiDocs\ApiDocsServiceProvider;
use App\Modules\V1\Branches\BranchesServiceProvider;
use App\Modules\V1\Catalog\CatalogServiceProvider;
use App\Modules\V1\CustomerAuth\CustomerAuthServiceProvider;
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
    ApiDocsServiceProvider::class,
    BranchesServiceProvider::class,
    CatalogServiceProvider::class,
    CustomerAuthServiceProvider::class,
    OnboardingServiceProvider::class,
    TenantsServiceProvider::class,
    UsersServiceProvider::class,
];
