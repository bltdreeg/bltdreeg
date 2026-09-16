<?php

namespace App\Providers\Filament;

use App\Http\Middleware\BindTenantContext;
use BezhanSalleh\FilamentShield\Middleware\SyncShieldTenant;
use Bltdreeg\Core\Models\Tenant;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AppPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('app')
            ->path('')
            ->login()
            ->colors([
                'primary' => Color::Amber,
            ])
            ->tenant(Tenant::class, ownershipRelationship: 'tenants', slugAttribute: 'slug')
            ->discoverResources(in: app_path('Modules/V1'), for: 'App\\Modules\\V1')
            ->discoverPages(in: app_path('Modules/V1'), for: 'App\\Modules\\V1')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Modules/V1'), for: 'App\\Modules\\V1')
            ->widgets([
                AccountWidget::class,
                FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->tenantMiddleware([
                SyncShieldTenant::class,
                BindTenantContext::class,
            ], isPersistent: true)
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
