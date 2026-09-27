<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages;

use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\PurchaseResource;
use App\Modules\V1\Inventory\Services\PurchaseService;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Saving goes through PurchaseService, which derives the header totals from the
 * item rows. Writing the model directly from the page would let those two drift.
 */
class CreatePurchase extends CreateRecord
{
    protected static string $resource = PurchaseResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.purchase');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordCreation(array $data): Model
    {
        try {
            return app(PurchaseService::class)->create(
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
