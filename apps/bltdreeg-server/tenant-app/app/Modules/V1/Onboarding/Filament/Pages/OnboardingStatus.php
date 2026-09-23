<?php

namespace App\Modules\V1\Onboarding\Filament\Pages;

use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Filament\Facades\Filament;
use Filament\Pages\Page;
use Illuminate\Contracts\Support\Htmlable;

class OnboardingStatus extends Page
{
    protected static string $layout = 'filament.layouts.onboarding';

    protected string $view = 'filament.pages.onboarding-status';

    protected static ?string $slug = 'onboarding-status';

    protected static bool $shouldRegisterNavigation = false;

    public function mount(): void
    {
        $tenant = $this->tenant();

        if ($tenant->statusIs(TenantStatusEnum::DRAFT)) {
            $this->redirect(Onboarding::getUrl(tenant: $tenant));
        } elseif ($tenant->isApproved()) {
            $this->redirect(Filament::getUrl($tenant));
        }
    }

    public function getTitle(): string|Htmlable
    {
        return __('core::onboarding.status_page.title');
    }

    public function getHeading(): string|Htmlable
    {
        return '';
    }

    protected function tenant(): Tenant
    {
        $tenant = Filament::getTenant();

        abort_unless(Filament::auth()->check() && $tenant instanceof Tenant, 404);

        return $tenant;
    }
}
