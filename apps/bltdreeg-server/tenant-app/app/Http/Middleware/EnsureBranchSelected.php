<?php

namespace App\Http\Middleware;

use App\Modules\V1\Branches\Filament\Pages\SelectBranch;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchSelection;
use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBranchSelected
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = Filament::getTenant();

        /** @var User|null $user */
        $user = Filament::auth()->user();

        if (! $tenant || ! $user) {
            return $next($request);
        }

        if ($this->isSelectBranchRequest($request)) {
            return $next($request);
        }

        $selection = app(BranchSelection::class);

        if ($selection->resolve($user, $tenant)) {
            return $next($request);
        }

        if ($selection->autoSelectIfOnlyOne($user, $tenant)) {
            return $next($request);
        }

        if ($selection->allowedFor($user, $tenant)->isEmpty()) {
            return $next($request);
        }

        return redirect()->to(SelectBranch::getUrl(tenant: $tenant));
    }

    protected function isSelectBranchRequest(Request $request): bool
    {
        $routeName = (string) $request->route()?->getName();

        return str_contains($routeName, 'select-branch')
            || str_ends_with('/'.trim($request->path(), '/'), '/select-branch');
    }
}
