<?php

namespace App\Providers;

use App\Modules\V1\Hr\Policies\EmployeePolicy;
use App\Modules\V1\Hr\Policies\JobTypePolicy;
use App\Modules\V1\Roles\Models\Role;
use App\Modules\V1\Roles\Policies\RolePolicy;
use App\Modules\V1\Services\Models\Service;
use App\Modules\V1\Services\Models\ServiceCategory;
use App\Modules\V1\Services\Policies\ServiceCategoryPolicy;
use App\Modules\V1\Services\Policies\ServicePolicy;
use BezhanSalleh\LanguageSwitch\LanguageSwitch;
use Bltdreeg\Core\Models\JobType;
use Bltdreeg\Core\Models\Service as CoreService;
use Bltdreeg\Core\Models\ServiceCategory as CoreServiceCategory;
use Bltdreeg\Core\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(JobType::class, JobTypePolicy::class);
        Gate::policy(User::class, EmployeePolicy::class);
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(ServiceCategory::class, ServiceCategoryPolicy::class);
        Gate::policy(CoreService::class, ServicePolicy::class);
        Gate::policy(CoreServiceCategory::class, ServiceCategoryPolicy::class);

        Gate::before(function ($user) {
            if ($user instanceof User && $user->is_super_admin) {
                return true;
            }

            return null;
        });

        LanguageSwitch::configureUsing(function (LanguageSwitch $switch) {
            $switch->locales(['en', 'ar']);
        });
    }
}
