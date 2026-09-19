<?php

namespace App\Http\Middleware;

use Bltdreeg\Core\Support\BranchContext;
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

        app(BranchContext::class)->flush();

        if ($tenant) {
            app(TenantContext::class)->set($tenant);
            app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());

            $branch = Filament::auth()->user()?->branch;

            if ($branch && $branch->tenant_id === $tenant->getKey()) {
                app(BranchContext::class)->set($branch);
            }
        }

        return $next($request);
    }
}
