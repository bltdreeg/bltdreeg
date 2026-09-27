<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Purchases\RelationManagers;

use App\Modules\V1\Inventory\Support\InventoryPresenter;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * The stock movements this purchase produced, once it has been received. Empty for
 * a draft, because nothing has hit the shelves yet.
 */
class PurchaseTransactionsRelationManager extends RelationManager
{
    protected static string $relationship = 'transactions';

    public static function getTitle(Model $ownerRecord, string $pageClass): string
    {
        return __('core::inventory.movements');
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('product.name')
                    ->label(__('core::inventory.product'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('branch.name')
                    ->label(__('core::inventory.branch'))
                    ->placeholder('—'),
                TextColumn::make('created_at')
                    ->label(__('core::inventory.recorded_at'))
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('quantity')
                    ->label(__('core::inventory.movement'))
                    ->state(fn (InventoryTransaction $record): string => InventoryPresenter::movement($record))
                    ->color(fn (InventoryTransaction $record): string => $record->isIncrease() ? 'success' : 'danger')
                    ->sortable(),
                TextColumn::make('balance_after')
                    ->label(__('core::inventory.balance_after'))
                    ->state(fn (InventoryTransaction $record): string => InventoryPresenter::quantity($record->balance_after))
                    ->sortable(),
                TextColumn::make('notes')
                    ->label(__('core::inventory.notes'))
                    ->limit(30)
                    ->placeholder('—')
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated(false)
            ->recordActions([])
            ->headerActions([]);
    }

    protected function getHeaderActions(): array
    {
        return [];
    }
}
