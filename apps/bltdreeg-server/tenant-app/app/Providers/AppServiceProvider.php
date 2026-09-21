<?php

namespace App\Providers;

use App\Modules\V1\Branches\Policies\BranchPolicy;
use App\Modules\V1\Hr\Policies\EmployeeAttendancePolicy;
use App\Modules\V1\Hr\Policies\EmployeePolicy;
use App\Modules\V1\Hr\Policies\JobTypePolicy;
use App\Modules\V1\Hr\Policies\ShiftPolicy;
use App\Modules\V1\Services\Models\Service;
use App\Modules\V1\Services\Models\ServiceCategory;
use App\Modules\V1\Services\Policies\ServiceCategoryPolicy;
use App\Modules\V1\Services\Policies\ServicePolicy;
use BezhanSalleh\LanguageSwitch\Enums\TriggerStyle;
use BezhanSalleh\LanguageSwitch\LanguageSwitch;
use Bltdreeg\Core\Models\Branch;
use Bltdreeg\Core\Models\EmployeeAttendance;
use Bltdreeg\Core\Models\JobType;
use Bltdreeg\Core\Models\Service as CoreService;
use Bltdreeg\Core\Models\ServiceCategory as CoreServiceCategory;
use Bltdreeg\Core\Models\Shift;
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
        Gate::policy(JobType::class, JobTypePolicy::class);
        Gate::policy(User::class, EmployeePolicy::class);
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(ServiceCategory::class, ServiceCategoryPolicy::class);
        Gate::policy(CoreService::class, ServicePolicy::class);
        Gate::policy(CoreServiceCategory::class, ServiceCategoryPolicy::class);
        Gate::policy(Branch::class, BranchPolicy::class);
        Gate::policy(EmployeeAttendance::class, EmployeeAttendancePolicy::class);
        Gate::policy(Shift::class, ShiftPolicy::class);

        Gate::before(function ($user) {
            if ($user instanceof User && $user->is_super_admin) {
                return true;
            }

            return null;
        });

        LanguageSwitch::configureUsing(function (LanguageSwitch $switch) {
            $switch->locales(['en', 'ar']);

            $switch->trigger(style: TriggerStyle::Icon);
            $switch->trigger(style: TriggerStyle::Flag);
            $switch->trigger(style: TriggerStyle::Avatar);
        });
    }
}
