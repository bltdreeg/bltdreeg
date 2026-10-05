<?php

namespace Bltdreeg\Core\Providers;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Observers\TenantObserver;
use Bltdreeg\Core\Modules\Tenancy\Policies\BranchPolicy;
use Bltdreeg\Core\Modules\Catalog\Policies\CatalogJobTypePolicy;
use Bltdreeg\Core\Modules\Catalog\Policies\CatalogServiceCategoryPolicy;
use Bltdreeg\Core\Modules\Catalog\Policies\CatalogServicePolicy;
use Bltdreeg\Core\Modules\Auth\Policies\RolePolicy;
use Bltdreeg\Core\Modules\Onboarding\Policies\TenantLegalDocumentPolicy;
use Bltdreeg\Core\Modules\Onboarding\Policies\TenantOnboardingSubmissionPolicy;
use Bltdreeg\Core\Modules\Tenancy\Policies\TenantPolicy;
use Bltdreeg\Core\Modules\Auth\Policies\UserPolicy;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class CoreServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../config/geo.php', 'geo');

        $this->app->scoped(TenantContext::class);
        $this->app->scoped(BranchContext::class);

        $this->registerIdentityDocumentsDisk();
    }

    /**
     * Identity documents live outside both apps' storage/ so the tenant app (upload) and
     * central app (review) share one private root. Never public, never served directly.
     */
    private function registerIdentityDocumentsDisk(): void
    {
        $key = 'filesystems.disks.'.TenantLegalDocument::DISK;

        if (config()->has($key)) {
            return;
        }

        config([$key => [
            'driver' => 'local',
            'root' => env('IDENTITY_DOCUMENTS_ROOT', base_path('../storage/identity-documents')),
            'visibility' => 'private',
            'serve' => false,
            'throw' => true,
            'report' => false,
        ]]);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');
        $this->loadTranslationsFrom(__DIR__.'/../../lang', 'core');

        Tenant::observe(TenantObserver::class);

        Gate::policy(Tenant::class, TenantPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Branch::class, BranchPolicy::class);
        Gate::policy(CatalogJobType::class, CatalogJobTypePolicy::class);
        Gate::policy(CatalogService::class, CatalogServicePolicy::class);
        Gate::policy(CatalogServiceCategory::class, CatalogServiceCategoryPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(TenantOnboardingSubmission::class, TenantOnboardingSubmissionPolicy::class);
        Gate::policy(TenantLegalDocument::class, TenantLegalDocumentPolicy::class);
    }
}
