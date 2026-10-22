<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages;

use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\InventoryResource;
use App\Modules\V1\Inventory\Services\InventoryService;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditInventory extends EditRecord
{
    protected static string $resource = InventoryResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.edit_stock_row');
    }

    /**
     * The quantity field is a count, not a free edit: routing it through
     * `adjustTo` records the difference as an adjustment movement so the row
     * never holds a balance the ledger cannot explain.
     *
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        /** @var Inventory $record */
        $service = app(InventoryService::class);

        try {
            // The count is applied first: the reservation is validated against
            // the resulting balance, so validating it against the old quantity
            // would reject a perfectly valid pairing and accept an invalid one.
            $service->adjustTo(
                inventory: $record,
                newQuantity: (float) $data['quantity'],
                notes: $data['notes'] ?? null,
            );

            $record = $service->setReserved(
                inventory: $record,
                reservedQuantity: (float) $data['reserved_quantity'],
            );
        } catch (InventoryException $exception) {
            Notification::make()
                ->title(__('core::inventory.stock'))
                ->body($exception->getMessage())
                ->danger()
                ->send();

            $this->halt();
        }

        return $record->refresh();
    }

    protected function getRedirectUrl(): string
    {
        return InventoryResource::getUrl('index');
    }

    /**
     * Deleting a stock row would orphan the movements and the purchases that
     * credited it, so the row is emptied by adjusting it to zero instead.
     */
    protected function canDelete(Model $record): bool
    {
        return false;
    }
}
