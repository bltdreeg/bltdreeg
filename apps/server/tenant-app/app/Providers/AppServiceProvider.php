<?php

namespace App\Providers;

use App\Modules\V1\Crm\Http\Middleware\RequireCrmApiTeam;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($root = config('app.url')) {
            URL::forceRootUrl($root);
        }

        $this->guardCrmApiRoutes();
    }

    /**
     * Append RequireCrmApiTeam to every laravel-crm REST API route.
     *
     * Done here, per-route, rather than via pushMiddlewareToGroup('crm-api', ...):
     * that group's middleware runs before SetApiTeamContext on these routes
     * (it is expanded where the vendor lists 'crm-api' in the route's own
     * middleware array, ahead of SetApiTeamContext), so pushing onto the
     * group would not guarantee our check sees the resolved tenant. Route::
     * getRoutes() is populated once routes are booted, so this must run in
     * boot(), not register().
     */
    protected function guardCrmApiRoutes(): void
    {
        $prefix = trim(config('laravel-crm.route_prefix', 'crm'), '/').'/api/v2';

        foreach (Route::getRoutes() as $route) {
            if (Str::startsWith(trim($route->uri(), '/'), $prefix)) {
                $route->middleware(RequireCrmApiTeam::class);
            }
        }
    }
}
