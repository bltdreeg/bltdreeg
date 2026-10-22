<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages;

use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\PurchaseResource;
use App\Modules\V1\Inventory\Services\PurchaseService;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewPurchase extends ViewRecord
{
    protected static string $resource = PurchaseResource::class;

    public function getTitle(): string
    {
        return $this->record->purchase_number;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('receive')
                ->label(__('core::inventory.receive_purchase'))
                ->icon('heroicon-o-inbox-arrow-down')
                ->color('success')
                ->requiresConfirmation()
                ->authorize('Receive:Purchase')
                ->visible(fn (): bool => $this->record->isDraft())
                ->action(function (): void {
                    try {
                        app(PurchaseService::class)->receive($this->record);
                    } catch (InventoryException $exception) {
                        Notification::make()
                            ->title(__('core::inventory.receive_purchase'))
                            ->body($exception->getMessage())
                            ->danger()
                            ->send();

                        return;
                    }

                    Notification::make()
                        ->title(__('core::inventory.received_successfully'))
                        ->success()
                        ->send();
                }),
            EditAction::make()
                ->disabled(fn (): bool => $this->record->isReceived()),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl();
    }
}
