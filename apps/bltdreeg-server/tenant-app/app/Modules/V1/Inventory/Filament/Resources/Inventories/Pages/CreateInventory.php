<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages;

use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\InventoryResource;
use App\Modules\V1\Inventory\Services\InventoryService;
use App\Modules\V1\Inventory\Support\InventoryDirectory;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateInventory extends CreateRecord
{
    protected static string $resource = InventoryResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.new_stock_row');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordCreation(array $data): Model
    {
        $product = InventoryDirectory::products()->firstWhere('id', $data['product_id']);
        $branch = InventoryDirectory::branches()->firstWhere('id', $data['branch_id']);

        if (! $product || ! $branch) {
            Notification::make()
                ->title(__('core::inventory.stock'))
                ->body(__('core::inventory.product_not_found'))
                ->danger()
                ->send();

            $this->halt();
        }

        try {
            return app(InventoryService::class)->open(
                product: $product,
                branch: $branch,
                openingQuantity: (float) $data['quantity'],
                reservedQuantity: (float) $data['reserved_quantity'],
                notes: $data['notes'] ?? null,
            );
        } catch (InventoryException $exception) {
            Notification::make()
                ->title(__('core::inventory.stock'))
                ->body($exception->getMessage())
                ->danger()
                ->send();

            $this->halt();
        }
    }

    protected function getRedirectUrl(): string
    {
        return InventoryResource::getUrl('index');
    }

    /**
     * A stock row is never deleted from the UI: the ledger and the purchase that
     * credited it stay meaningful, and a row with no stock is simply empty.
     */
    protected function canDelete(Model $record): bool
    {
        return false;
    }
}
