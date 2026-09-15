<?php

namespace App\Modules\V1\Crm\Filament;

use Filament\Contracts\Plugin;
use Filament\Panel;
use Filament\View\PanelsRenderHook;
use Illuminate\Support\Facades\Blade;
use VentureDrake\LaravelCrmFilament\LaravelCrmPlugin;
use VentureDrake\LaravelCrmFilament\Resources\Chat\ChatConversationResource;
use VentureDrake\LaravelCrmFilament\Resources\ChatWidgets\ChatWidgetResource;
use VentureDrake\LaravelCrmFilament\Resources\Customers\CustomerResource;
use VentureDrake\LaravelCrmFilament\Support\LogoUrl;
use VentureDrake\LaravelCrmFilament\Support\TenancyGuard;

/**
 * Barber-shop CRM surface: Customers + Chat.
 *
 * Upstream LaravelCrmPlugin always registers People, Organizations, activities,
 * products, and settings lookups. We keep only the resources this shop needs.
 *
 * Host IDEs cannot see the Docker vendor volume; run `make ide-sync` so
 * VentureDrake types resolve on the host.
 *
 * @method $this modules(array $modules)
 * @method $this allowUnsupportedTenancy(bool $condition = true)
 */
class TenantSafeCrmPlugin extends LaravelCrmPlugin implements Plugin
{
    public static function make(): static
    {
        return app(static::class);
    }

    public function getId(): string
    {
        return parent::getId();
    }

    public function getResources(): array
    {
        $resources = [CustomerResource::class];

        if ($this->isModuleEnabled('chat')) {
            $resources[] = ChatConversationResource::class;
            $resources[] = ChatWidgetResource::class;
        }

        return $resources;
    }

    public function register(Panel $panel): void
    {
        $settings = app()->bound('laravel-crm.settings') ? app('laravel-crm.settings') : null;
        $brandName = $this->getBrand() ?? ($settings?->get('organization_name')) ?? 'Shop';
        $panel->brandName($brandName);

        $logo = LogoUrl::resolve($settings?->get('logo_file'));
        if ($logo) {
            $panel->brandLogo($logo);
        }

        $panel
            ->resources($this->getResources())
            ->navigationGroups(['Contacts'])
            ->colors(['primary' => '#05b3a9']);

        $panel->renderHook(
            PanelsRenderHook::BODY_START,
            fn (): string => TenancyGuard::shouldWarn($this->allowsUnsupportedTenancy())
                ? Blade::render(
                    '<div class="fi-banner bg-danger-600 px-4 py-2 text-sm text-white">{{ $message }}</div>',
                    ['message' => TenancyGuard::message()],
                )
                : '',
        );
    }

    public function boot(Panel $panel): void
    {
        //
    }
}
