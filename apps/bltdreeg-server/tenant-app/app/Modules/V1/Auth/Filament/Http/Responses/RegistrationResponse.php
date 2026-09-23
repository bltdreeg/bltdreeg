<?php

namespace App\Modules\V1\Auth\Filament\Http\Responses;

use App\Modules\V1\Onboarding\Filament\Pages\Onboarding;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Filament\Auth\Http\Responses\Contracts\RegistrationResponse as Responsable;
use Filament\Facades\Filament;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Session;
use Livewire\Features\SupportRedirects\Redirector;

/**
 * Always land a freshly registered salon owner on their own onboarding wizard.
 * Filament's default uses redirect()->intended(), which can send them to a stale
 * URL from a previous visit (e.g. /bloom/attendance) and 404.
 */
class RegistrationResponse implements Responsable
{
    public function toResponse($request): RedirectResponse|Redirector
    {
        Session::forget('url.intended');

        /** @var User|null $user */
        $user = Filament::auth()->user();
        $tenant = $this->resolveTenant($user);

        if ($tenant) {
            return redirect()->to(Onboarding::getUrl(tenant: $tenant));
        }

        return redirect()->to(Filament::getUrl());
    }

    private function resolveTenant(?User $user): ?Tenant
    {
        if (! $user) {
            return null;
        }

        $tenant = $user->tenants()->latest('tenant_user.id')->first();

        return $tenant instanceof Tenant ? $tenant : null;
    }
}
