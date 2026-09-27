<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Products\RelationManagers;

use App\Modules\V1\Inventory\Support\InventoryDirectory;
use App\Modules\V1\Inventory\Support\InventoryPresenter;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * Where this product is stocked, branch by branch. Read-only on purpose: the only
 * way to change a quantity is an adjustment through InventoryService, so this
 * table offers no create or delete affordance.
 */
class StockRelationManager extends RelationManager
{
    protected static string $relationship = 'inventories';

    public static function getTitle(Model $ownerRecord, string $pageClass): string
    {
        return __('core::inventory.stock');
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('branch.name')
            ->columns([
                TextColumn::make('branch.name')
                    ->label(__('core::inventory.branch'))
                    ->formatStateUsing(fn (Inventory $record): string => InventoryDirectory::branchLabel($record->branch))
                    ->sortable(),
                TextColumn::make('quantity')
                    ->label(__('core::inventory.on_hand'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::quantityWithUnit($record->quantity, $record->product?->unit))
                    ->sortable(),
                TextColumn::make('reserved_quantity')
                    ->label(__('core::inventory.reserved_quantity'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::quantity($record->reserved_quantity))
                    ->sortable(),
                TextColumn::make('available')
                    ->label(__('core::inventory.available_quantity'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::quantity($record->availableQuantity())),
                TextColumn::make('status')
                    ->label(__('core::inventory.stock_status'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::stockStatusLabel($record->status()))
                    ->badge()
                    ->color(fn (Inventory $record): string => InventoryPresenter::stockStatusColor($record->status())),
            ])
            ->filters([
                SelectFilter::make('branch_id')
                    ->label(__('core::inventory.branch'))
                    ->options(fn (): array => InventoryDirectory::branchOptions())
                    ->searchable(),
            ])
            ->defaultSort('quantity', 'desc')
            ->paginated(false)
            // No row actions: a stock row is edited through Inventory's own
            // "adjust" action, and Inventory has no view page to link to.
            ->recordActions([])
            ->headerActions([]);
    }

    protected function getHeaderActions(): array
    {
        return [];
    }
}
