<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages;

use App\Modules\V1\Inventory\Filament\Resources\Purchases\PurchaseResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPurchases extends ListRecords
{
    protected static string $resource = PurchaseResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.purchases');
    }

    /**
     * @return array<CreateAction>
     */
    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
