<?php

namespace App\Http\Middleware;

use Bltdreeg\Core\Support\TenantContext;
use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class BindTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = Filament::getTenant();

        if ($tenant) {
            app(TenantContext::class)->set($tenant);
            app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());
        }

        return $next($request);
    }
}
