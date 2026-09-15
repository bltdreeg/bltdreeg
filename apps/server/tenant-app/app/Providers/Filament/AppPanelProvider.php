<?php

namespace App\Providers\Filament;

use App\Modules\V1\Crm\Filament\TenantSafeCrmPlugin;
use App\Modules\V1\Crm\Http\Middleware\BindCrmTenant;
use App\Modules\V1\Settings\Filament\Resources\Roles\TenantRoleResource;
use App\Modules\V1\Settings\Filament\Resources\TeamMembers\TeamMemberResource;
use Bltdreeg\Core\Models\Team;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Resources\Resource;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AppPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        // Filament scopes via Eloquent relations; CRM models only have team_id +
        // BelongsToTeamsScope. BindCrmTenant keeps currentTeam = Filament tenant.
        Resource::scopeToTenant(false);

        return $panel
            ->default()
            ->id('app')
            ->path('')
            ->login()
            ->colors(['primary' => Color::Amber])
            ->tenant(Team::class, ownershipRelationship: 'teams', slugAttribute: 'slug')
            ->tenantMiddleware([BindCrmTenant::class], isPersistent: true)
            ->plugin(
                TenantSafeCrmPlugin::make()
                    // Barber shop v1: customers + chat widgets.
                    ->modules([
                        'customers',
                        'chat',
                    ])
                    ->allowUnsupportedTenancy()
            )
            ->resources([
                TeamMemberResource::class,
                TenantRoleResource::class,
            ])
            ->pages([Dashboard::class])
            ->widgets([AccountWidget::class])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([Authenticate::class]);
    }
}
