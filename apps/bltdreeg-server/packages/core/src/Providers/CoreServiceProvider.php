<?php

namespace Bltdreeg\Core\Providers;

use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Observers\TenantObserver;
use Bltdreeg\Core\Support\TenantContext;
use Illuminate\Support\ServiceProvider;

class CoreServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->scoped(TenantContext::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');

        Tenant::observe(TenantObserver::class);
    }
}
