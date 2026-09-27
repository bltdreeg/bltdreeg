<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\InventoryTransactions\Pages;

use App\Modules\V1\Inventory\Filament\Resources\InventoryTransactions\InventoryTransactionResource;
use Filament\Resources\Pages\ListRecords;

class ListInventoryTransactions extends ListRecords
{
    protected static string $resource = InventoryTransactionResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.inventory_transactions');
    }
}
