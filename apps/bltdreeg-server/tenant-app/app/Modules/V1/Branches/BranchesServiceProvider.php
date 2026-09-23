<?php

declare(strict_types=1);

namespace App\Modules\V1\Branches;

use App\Modules\V1\Branches\Policies\BranchPolicy;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class BranchesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Branch::class, BranchPolicy::class);
    }
}
