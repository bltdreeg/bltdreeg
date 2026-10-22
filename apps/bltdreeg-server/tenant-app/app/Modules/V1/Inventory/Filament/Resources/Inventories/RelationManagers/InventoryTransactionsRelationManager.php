<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Inventories\RelationManagers;

use App\Modules\V1\Inventory\Support\InventoryPresenter;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * The ledger for one branch's holding of one product. Read-only: the rows are the
 * evidence for every balance on the parent record, so editing them would make the
 * history disagree with itself.
 */
class InventoryTransactionsRelationManager extends RelationManager
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
                TextColumn::make('created_at')
                    ->label(__('core::inventory.recorded_at'))
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('type')
                    ->label(__('core::inventory.type'))
                    ->formatStateUsing(fn (InventoryTransaction $record): string => $record->type->label())
                    ->badge()
                    ->color(fn (InventoryTransaction $record): string => InventoryPresenter::transactionTypeColor($record->type))
                    ->icon(fn (InventoryTransaction $record): Heroicon => InventoryPresenter::transactionTypeIcon($record->type))
                    ->sortable(),
                TextColumn::make('quantity')
                    ->label(__('core::inventory.movement'))
                    ->state(fn (InventoryTransaction $record): string => InventoryPresenter::movement($record))
                    ->color(fn (InventoryTransaction $record): string => match (true) {
                        $record->isIncrease() => 'success',
                        $record->isDecrease() => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('balance_after')
                    ->label(__('core::inventory.balance_after'))
                    ->state(fn (InventoryTransaction $record): string => InventoryPresenter::quantity($record->balance_after))
                    ->sortable(),
                TextColumn::make('unit_cost')
                    ->label(__('core::inventory.unit_cost'))
                    ->formatStateUsing(fn ($state): string => $state === null ? '—' : InventoryPresenter::money($state))
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('notes')
                    ->label(__('core::inventory.notes'))
                    ->limit(30)
                    ->placeholder('—')
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated(false)
            // Movements are append-only and the ledger resource is a read-only
            // list, so there is no row to open and nothing to edit here.
            ->recordActions([])
            ->headerActions([]);
    }

    protected function getHeaderActions(): array
    {
        return [];
    }
}
