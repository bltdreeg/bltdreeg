<?php

namespace App\Modules\V1\Inventory\Filament\Resources\InventoryTransactions;

use App\Modules\V1\Inventory\Filament\Resources\InventoryTransactions\Pages\ListInventoryTransactions;
use App\Modules\V1\Inventory\Support\InventoryDirectory;
use App\Modules\V1\Inventory\Support\InventoryPresenter;
use BackedEnum;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Filament\Forms\Components\DatePicker;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * The stock ledger, across every branch and product.
 *
 * Entirely read-only, and deliberately not given create, edit or delete. A
 * movement is the evidence for a balance; if one could be edited or removed the
 * `balance_after` column would stop being a check on anything. Corrections go
 * through a fresh, opposing movement instead.
 */
class InventoryTransactionResource extends Resource
{
    protected static ?string $model = InventoryTransaction::class;

    protected static ?string $slug = 'inventory-transactions';

    protected static ?int $navigationSort = 6;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowsRightLeft;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::inventory.inventory');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::inventory.inventory_transactions');
    }

    public static function getModelLabel(): string
    {
        return __('core::inventory.inventory_transaction');
    }

    public static function getPluralModelLabel(): string
    {
        return __('core::inventory.inventory_transactions');
    }

    public static function canCreate(): bool
    {
        return false;
    }

    /**
     * Overriding only `canCreate` is not enough: `canEdit` and `canDelete` would
     * still fall through to the policy, which allows a super admin. A movement is
     * append-only for everyone.
     */
    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }

    public static function getEloquentQuery(): Builder
    {
        return InventoryDirectory::scopeToTenant(parent::getEloquentQuery())
            ->with(['product', 'branch']);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextEntry::make('product.name')
                    ->label(__('core::inventory.product')),
                TextEntry::make('branch.name')
                    ->label(__('core::inventory.branch'))
                    ->formatStateUsing(fn (InventoryTransaction $record): string => InventoryDirectory::branchLabel($record->branch)),
                TextEntry::make('type')
                    ->label(__('core::inventory.type'))
                    ->formatStateUsing(fn (InventoryTransaction $record): string => $record->type->label())
                    ->badge()
                    ->color(fn (InventoryTransaction $record): string => InventoryPresenter::transactionTypeColor($record->type)),
                TextEntry::make('quantity')
                    ->label(__('core::inventory.movement'))
                    ->state(fn (InventoryTransaction $record): string => InventoryPresenter::movement($record)),
                TextEntry::make('balance_after')
                    ->label(__('core::inventory.balance_after'))
                    ->state(fn (InventoryTransaction $record): string => InventoryPresenter::quantity($record->balance_after)),
                TextEntry::make('unit_cost')
                    ->label(__('core::inventory.unit_cost'))
                    ->formatStateUsing(fn ($state): string => $state === null ? '—' : InventoryPresenter::money($state))
                    ->placeholder('—'),
                TextEntry::make('reference')
                    ->label(__('core::inventory.reference'))
                    ->state(fn (InventoryTransaction $record): string => self::referenceLabel($record) ?? '—')
                    ->placeholder('—'),
                TextEntry::make('notes')
                    ->label(__('core::inventory.notes'))
                    ->placeholder('—'),
                TextEntry::make('created_at')
                    ->label(__('core::inventory.recorded_at'))
                    ->dateTime(),
            ]);
    }

    public static function table(Table $table): Table
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
                TextColumn::make('product.name')
                    ->label(__('core::inventory.product'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('branch.name')
                    ->label(__('core::inventory.branch'))
                    ->formatStateUsing(fn (InventoryTransaction $record): string => InventoryDirectory::branchLabel($record->branch))
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
                TextColumn::make('reference')
                    ->label(__('core::inventory.reference'))
                    ->state(fn (InventoryTransaction $record): string => self::referenceLabel($record) ?? '—')
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('notes')
                    ->label(__('core::inventory.notes'))
                    ->limit(30)
                    ->placeholder('—')
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label(__('core::inventory.type'))
                    ->options(InventoryPresenter::transactionTypeOptions()),
                SelectFilter::make('branch_id')
                    ->label(__('core::inventory.branch'))
                    ->options(fn (): array => InventoryDirectory::branchOptions())
                    ->searchable(),
                SelectFilter::make('product_id')
                    ->label(__('core::inventory.product'))
                    ->options(fn (): array => InventoryDirectory::productOptions())
                    ->searchable(),
                Filter::make('recorded_today')
                    ->label(__('core::inventory.recorded_today'))
                    ->query(fn (Builder $query): Builder => $query->whereDate('created_at', today())),
                Filter::make('recorded_on')
                    ->label(__('core::inventory.recorded_on'))
                    ->form([
                        DatePicker::make('date'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query
                        ->when($data['date'] ?? null, fn (Builder $query, $date): Builder => $query->whereDate('created_at', $date))),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([])
            ->headerActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListInventoryTransactions::route('/'),
        ];
    }

    /**
     * Describe what a movement was for. A polymorphic reference could point at
     * several tables, so only the one the module writes is named — anything else
     * falls back to the raw type rather than guessing.
     */
    private static function referenceLabel(InventoryTransaction $record): ?string
    {
        if ($record->reference_id === null) {
            return null;
        }

        return match ($record->reference_type) {
            (new Purchase)->getMorphClass() => __('core::inventory.purchase_number').' #'.$record->reference_id,
            default => (string) $record->reference_type.' #'.$record->reference_id,
        };
    }
}
