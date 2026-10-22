<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages;

use App\Modules\V1\Inventory\Filament\Resources\Inventories\InventoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListInventories extends ListRecords
{
    protected static string $resource = InventoryResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.stock');
    }

    /**
     * @return array<CreateAction>
     */
    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label(__('core::inventory.new_stock_row')),
        ];
    }
}
