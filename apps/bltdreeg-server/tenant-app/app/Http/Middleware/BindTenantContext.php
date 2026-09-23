<?php

namespace App\Http\Middleware;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchSelection;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BindTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = Filament::getTenant();

        app(BranchContext::class)->flush();

        if ($tenant) {
            app(TenantContext::class)->set($tenant);

            /** @var User|null $user */
            $user = Filament::auth()->user();

            if ($user) {
                $branch = app(BranchSelection::class)->resolve($user, $tenant)
                    ?? app(BranchSelection::class)->autoSelectIfOnlyOne($user, $tenant);

                if ($branch) {
                    app(BranchContext::class)->set($branch);
                }
            }
        }

        return $next($request);
    }
}
