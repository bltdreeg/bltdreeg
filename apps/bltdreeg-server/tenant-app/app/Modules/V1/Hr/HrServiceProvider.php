<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr;

use App\Modules\V1\Hr\Policies\EmployeeAdjustmentPolicy;
use App\Modules\V1\Hr\Policies\EmployeeAttendancePolicy;
use App\Modules\V1\Hr\Policies\EmployeePolicy;
use App\Modules\V1\Hr\Policies\JobTypePolicy;
use App\Modules\V1\Hr\Policies\ShiftPolicy;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Hr\Models\EmployeeAdjustment;
use Bltdreeg\Core\Modules\Hr\Models\EmployeeAttendance;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Hr\Models\Shift;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class HrServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(JobType::class, JobTypePolicy::class);
        Gate::policy(User::class, EmployeePolicy::class);
        Gate::policy(EmployeeAttendance::class, EmployeeAttendancePolicy::class);
        Gate::policy(Shift::class, ShiftPolicy::class);
        Gate::policy(EmployeeAdjustment::class, EmployeeAdjustmentPolicy::class);
    }
}
