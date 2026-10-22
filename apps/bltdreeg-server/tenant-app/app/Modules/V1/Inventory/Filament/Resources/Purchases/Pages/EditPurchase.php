<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages;

use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\PurchaseResource;
use App\Modules\V1\Inventory\Services\PurchaseService;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditPurchase extends EditRecord
{
    protected static string $resource = PurchaseResource::class;

    public function getTitle(): string
    {
        return $this->record->purchase_number;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        try {
            return app(PurchaseService::class)->update(
                purchase: $record,
                attributes: $data,
                items: $data['items'] ?? [],
            );
        } catch (InventoryException $exception) {
            Notification::make()
                ->title(__('core::inventory.purchase'))
                ->body($exception->getMessage())
                ->danger()
                ->send();

            $this->halt();
        }
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }
}
