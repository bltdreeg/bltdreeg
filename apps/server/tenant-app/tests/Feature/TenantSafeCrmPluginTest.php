<?php

namespace Tests\Feature;

use App\Modules\V1\Crm\Filament\TenantSafeCrmPlugin;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;
use VentureDrake\LaravelCrmFilament\Pages\Integrations;
use VentureDrake\LaravelCrmFilament\Resources\ChatWidgets\ChatWidgetResource;
use VentureDrake\LaravelCrmFilament\Resources\Customers\CustomerResource;
use VentureDrake\LaravelCrmFilament\Resources\Organizations\OrganizationResource;
use VentureDrake\LaravelCrmFilament\Resources\People\PersonResource;
use VentureDrake\LaravelCrmFilament\Resources\Products\ProductResource;

class TenantSafeCrmPluginTest extends TestCase
{
    public function test_barber_shop_surface_is_customers_and_chat(): void
    {
        $plugin = TenantSafeCrmPlugin::make()->modules([
            'customers' => true,
            'chat' => true,
        ]);

        $this->assertSame([
            CustomerResource::class,
            \VentureDrake\LaravelCrmFilament\Resources\Chat\ChatConversationResource::class,
            ChatWidgetResource::class,
        ], $plugin->getResources());

        $this->assertNotContains(PersonResource::class, $plugin->getResources());
        $this->assertNotContains(OrganizationResource::class, $plugin->getResources());
        $this->assertNotContains(ProductResource::class, $plugin->getResources());

        $pages = filament()->getPanel('app')->getPages();
        $this->assertNotContains(Integrations::class, $pages);

        $resources = filament()->getPanel('app')->getResources();
        $this->assertContains(CustomerResource::class, $resources);
        $this->assertContains(ChatWidgetResource::class, $resources);
        $this->assertNotContains(PersonResource::class, $resources);

        $this->assertTrue(Route::has('laravel-crm.portal.chat.embed'));
    }
}
