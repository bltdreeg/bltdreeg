<?php

namespace App\Http\Middleware;

use App\Modules\V1\Onboarding\Filament\Pages\Onboarding;
use App\Modules\V1\Onboarding\Filament\Pages\OnboardingStatus;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps salons that have not been approved yet inside the onboarding flow.
 * Must run before EnsureBranchSelected: a new salon has no branch yet.
 */
class EnsureOnboardingComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = Filament::getTenant();

        /** @var User|null $user */
        $user = Filament::auth()->user();

        if (! $tenant instanceof Tenant || ! $user || $user->is_super_admin || $tenant->isApproved()) {
            return $next($request);
        }

        $allowedPages = match ($tenant->status) {
            TenantStatusEnum::PENDING_REVIEW => ['onboarding-status'],
            TenantStatusEnum::DECLINED => ['onboarding-status', 'onboarding'],
            default => ['onboarding'],
        };

        if (in_array($this->currentPageSlug($request, $tenant), $allowedPages, true)) {
            return $next($request);
        }

        return redirect()->to($tenant->statusIs(TenantStatusEnum::PENDING_REVIEW) || $tenant->statusIs(TenantStatusEnum::DECLINED)
            ? OnboardingStatus::getUrl(tenant: $tenant)
            : Onboarding::getUrl(tenant: $tenant));
    }

    protected function currentPageSlug(Request $request, Tenant $tenant): ?string
    {
        $routeName = (string) $request->route()?->getName();

        if ($routeName === Onboarding::getRouteName()) {
            return 'onboarding';
        }

        if ($routeName === OnboardingStatus::getRouteName()) {
            return 'onboarding-status';
        }

        $path = trim($request->path(), '/');

        return match ($path) {
            $tenant->slug.'/onboarding' => 'onboarding',
            $tenant->slug.'/onboarding-status' => 'onboarding-status',
            default => null,
        };
    }
}
