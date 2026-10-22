<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Purchases\RelationManagers;

use App\Modules\V1\Inventory\Support\InventoryPresenter;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Bltdreeg\Core\Modules\Inventory\Models\PurchaseItem;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * What the purchase was for. Read-only because the items are edited through the
 * purchase form itself, and once received they must not change at all — the stock
 * they produced is already on the shelf.
 */
class PurchaseItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    public static function getTitle(Model $ownerRecord, string $pageClass): string
    {
        return __('core::inventory.items');
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('product.name')
                    ->label(__('core::inventory.product'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('product.sku')
                    ->label(__('core::inventory.sku'))
                    ->placeholder('—')
                    ->searchable()
                    ->toggleable(),
                TextColumn::make('quantity')
                    ->label(__('core::inventory.quantity'))
                    ->state(fn (PurchaseItem $record): string => InventoryPresenter::quantityWithUnit($record->quantity, $record->product?->unit))
                    ->sortable(),
                TextColumn::make('unit_cost')
                    ->label(__('core::inventory.unit_cost'))
                    ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state))
                    ->sortable(),
                TextColumn::make('discount')
                    ->label(__('core::inventory.discount'))
                    ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state))
                    ->toggleable(),
                TextColumn::make('tax')
                    ->label(__('core::inventory.tax'))
                    ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state))
                    ->toggleable(),
                TextColumn::make('total')
                    ->label(__('core::inventory.total'))
                    ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state))
                    ->sortable(),
            ])
            ->defaultSort('id')
            ->paginated(false)
            ->recordActions([])
            ->headerActions([]);
    }

    protected function getHeaderActions(): array
    {
        return [];
    }
}
