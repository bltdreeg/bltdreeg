<?php

declare(strict_types=1);

namespace App\Modules\V1\Services;

use App\Modules\V1\Services\Models\Service;
use App\Modules\V1\Services\Models\ServiceCategory;
use App\Modules\V1\Services\Policies\ServiceCategoryPolicy;
use App\Modules\V1\Services\Policies\ServicePolicy;
use Bltdreeg\Core\Modules\Services\Models\Service as CoreService;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory as CoreServiceCategory;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class ServicesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(ServiceCategory::class, ServiceCategoryPolicy::class);
        Gate::policy(CoreService::class, ServicePolicy::class);
        Gate::policy(CoreServiceCategory::class, ServiceCategoryPolicy::class);
    }
}
