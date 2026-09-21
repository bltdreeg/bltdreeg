<?php

namespace App\Providers\Filament;

use App\Filament\Auth\Pages\Login;
use App\Http\Middleware\BindTenantContext;
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use BezhanSalleh\FilamentShield\Middleware\SyncShieldTenant;
use Bltdreeg\Core\Models\Tenant;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use LaraZeus\SpatieTranslatable\SpatieTranslatablePlugin;

class AppPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('app')
            ->path('')
            ->viteTheme('resources/css/filament/app/theme.css')
            ->login(Login::class)
            ->font('Cairo')
            ->darkMode(false)
            ->colors([
                'primary' => [
                    50 => '#F0FDFA',
                    100 => '#CCFBF1',
                    200 => '#99F6E4',
                    300 => '#5EEAD4',
                    400 => '#2DD4BF',
                    500 => '#14B8A6',
                    600 => '#0D9488',
                    700 => '#0F766E',
                    800 => '#0B5A54',
                    900 => '#134E4A',
                    950 => '#042F2E',
                ],
                'gray' => [
                    50 => '#F7F8FA',
                    100 => '#EEF0F3',
                    200 => '#E5E7EB',
                    300 => '#D1D5DB',
                    400 => '#9CA3AF',
                    500 => '#6B7280',
                    600 => '#4B5563',
                    700 => '#374151',
                    800 => '#1F2937',
                    900 => '#111827',
                    950 => '#0E0F11',
                ],
                'success' => [
                    50 => '#F0FDF4',
                    100 => '#DCFCE7',
                    200 => '#BBF7D0',
                    300 => '#86EFAC',
                    400 => '#4ADE80',
                    500 => '#22C55E',
                    600 => '#16A34A',
                    700 => '#15803D',
                    800 => '#166534',
                    900 => '#14532D',
                    950 => '#052E16',
                ],
                'warning' => [
                    50 => '#FFFBEB',
                    100 => '#FEF3C7',
                    200 => '#FDE68A',
                    300 => '#FCD34D',
                    400 => '#FBBF24',
                    500 => '#F59E0B',
                    600 => '#D97706',
                    700 => '#B45309',
                    800 => '#92400E',
                    900 => '#78350F',
                    950 => '#451A03',
                ],
                'danger' => [
                    50 => '#FEF2F2',
                    100 => '#FEE2E2',
                    200 => '#FECACA',
                    300 => '#FCA5A5',
                    400 => '#F87171',
                    500 => '#EF4444',
                    600 => '#DC2626',
                    700 => '#B91C1C',
                    800 => '#991B1B',
                    900 => '#7F1D1D',
                    950 => '#450A0A',
                ],
            ])
            ->plugin(SpatieTranslatablePlugin::make()->defaultLocales(['ar', 'en']))
            ->plugins([
                FilamentShieldPlugin::make()
                    ->globallySearchable(false)
                    ->tenantRelationshipName('roles')
                    ->tenantOwnershipRelationshipName('team'),
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
            ])
            ->maxContentWidth('full');
    }
}
