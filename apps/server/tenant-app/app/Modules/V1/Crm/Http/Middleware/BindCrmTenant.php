<?php

namespace App\Modules\V1\Crm\Http\Middleware;

use Bltdreeg\Core\Models\Team;
use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class BindCrmTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = Filament::getTenant();
        $user = $request->user();

        abort_unless($tenant instanceof Team && $user?->canAccessTenant($tenant), 403);

        $user->switchTeam($tenant);
        app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());

        return $next($request);
    }
}
