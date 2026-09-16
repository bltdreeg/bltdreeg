<?php

namespace App\Providers\Filament;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\CatalogServiceCategoryResource;
use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\CatalogServiceResource;
use App\Modules\V1\Catalog\Filament\Resources\JobTypes\JobTypeResource;
use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\RoleTemplateResource;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\TenantResource;
use App\Modules\V1\Users\Filament\Resources\Users\UserResource;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('')
            ->login()
            ->colors([
                'primary' => Color::Amber,
            ])
            ->resources([
                TenantResource::class,
                UserResource::class,
                CatalogServiceCategoryResource::class,
                CatalogServiceResource::class,
                JobTypeResource::class,
                RoleTemplateResource::class,
            ])
            ->pages([
                Dashboard::class,
            ])
            ->widgets([
                AccountWidget::class,
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
            ->authMiddleware([
                Authenticate::class,
            ])
            ->authGuard('web')
            ->authPasswordBroker('users');
    }
}
