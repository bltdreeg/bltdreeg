<?php

namespace App\Modules\V1\Inventory\Filament\Resources\Inventories;

use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages\CreateInventory;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages\EditInventory;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages\ListInventories;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\RelationManagers\InventoryTransactionsRelationManager;
use App\Modules\V1\Inventory\Services\InventoryService;
use App\Modules\V1\Inventory\Support\InventoryDirectory;
use App\Modules\V1\Inventory\Support\InventoryPresenter;
use BackedEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Stock on hand, one row per branch and product.
 *
 * Rows are normally created by the first purchase, sale or transfer for that
 * pair, but they can also be opened by hand. Either way the quantity is only
 * ever written through InventoryService, which is what keeps the ledger and the
 * balance in step: a created row starts empty and an opening figure is applied
 * as an adjustment, so no balance is ever unexplained.
 *
 * A row is never deleted. Movements and the purchase that credited it stay
 * meaningful, and a row with no stock left is simply empty.
 */
class InventoryResource extends Resource
{
    protected static ?string $model = Inventory::class;

    protected static ?string $slug = 'inventories';

    protected static ?string $navigationLabel = 'Stock';

    protected static UnitEnum|string|null $navigationGroup = 'Inventory';

    protected static ?int $navigationSort = 3;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingStorefront;

    protected static ?string $modelLabel = 'stock';

    protected static ?string $pluralModelLabel = 'stock';

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::inventory.inventory');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::inventory.stock');
    }

    public static function getModelLabel(): string
    {
        return __('core::inventory.stock');
    }

    public static function getPluralModelLabel(): string
    {
        return __('core::inventory.stock');
    }

    public static function getEloquentQuery(): Builder
    {
        return InventoryDirectory::scopeToTenant(parent::getEloquentQuery())
            ->with(['product', 'branch']);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextEntry::make('product.name')
                    ->label(__('core::inventory.product')),
                TextEntry::make('branch.name')
                    ->label(__('core::inventory.branch'))
                    ->formatStateUsing(fn (Inventory $record): string => InventoryDirectory::branchLabel($record->branch)),
                TextEntry::make('quantity')
                    ->label(__('core::inventory.on_hand'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::quantityWithUnit($record->quantity, $record->product?->unit)),
                TextEntry::make('reserved_quantity')
                    ->label(__('core::inventory.reserved_quantity'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::quantity($record->reserved_quantity)),
                TextEntry::make('available')
                    ->label(__('core::inventory.available_quantity'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::quantity($record->availableQuantity())),
                TextEntry::make('status')
                    ->label(__('core::inventory.stock_status'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::stockStatusLabel($record->status()))
                    ->badge()
                    ->color(fn (Inventory $record): string => InventoryPresenter::stockStatusColor($record->status())),
            ]);
    }

    public static function table(Table $table): Table
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
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('available')
                    ->label(__('core::inventory.available_quantity'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::quantity($record->availableQuantity())),
                TextColumn::make('status')
                    ->label(__('core::inventory.stock_status'))
                    ->state(fn (Inventory $record): string => InventoryPresenter::stockStatusLabel($record->status()))
                    ->badge()
                    ->color(fn (Inventory $record): string => InventoryPresenter::stockStatusColor($record->status()))
                    ->sortable(query: self::sortByStatus()),
                TextColumn::make('updated_at')
                    ->label(__('core::global.updated_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('branch_id')
                    ->label(__('core::inventory.branch'))
                    ->options(fn (): array => InventoryDirectory::branchOptions())
                    ->searchable(),
                SelectFilter::make('product_id')
                    ->label(__('core::inventory.product'))
                    ->options(fn (): array => InventoryDirectory::productOptions(trackedOnly: true))
                    ->searchable(),
                Filter::make('low_stock')
                    ->label(__('core::inventory.low_stock'))
                    ->query(fn (Builder $query): Builder => $query
                        ->whereHas('product')
                        ->whereColumn('inventories.quantity', '<=', 'products.low_stock_threshold')),
            ])
            ->defaultSort('quantity', 'desc')
            ->recordActions([
                EditAction::make(),
                Action::make('adjust')
                    ->label(__('core::inventory.adjust_stock'))
                    ->authorize('Update:Inventory')
                    ->schema([
                        TextInput::make('quantity')
                            ->label(__('core::inventory.new_quantity'))
                            ->numeric()
                            ->minValue(0)
                            ->required()
                            ->default(fn (Inventory $record): float => (float) $record->quantity),
                        Textarea::make('notes')
                            ->label(__('core::inventory.reason'))
                            ->required()
                            ->maxLength(500),
                    ])
                    ->action(function (Inventory $record, array $data): void {
                        try {
                            app(InventoryService::class)->adjustTo(
                                inventory: $record,
                                newQuantity: (float) $data['quantity'],
                                notes: $data['notes'],
                            );
                        } catch (InventoryException $exception) {
                            Notification::make()
                                ->title(__('core::inventory.adjust_stock'))
                                ->body($exception->getMessage())
                                ->danger()
                                ->send();

                            return;
                        }

                        Notification::make()
                            ->title(__('core::inventory.adjustment_applied'))
                            ->success()
                            ->send();
                    }),
            ])
            ->headerActions([]);
    }

    public static function getRelations(): array
    {
        return [
            InventoryTransactionsRelationManager::class,
        ];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make(__('core::inventory.details'))
                ->columnSpanFull()
                ->schema([
                    Select::make('product_id')
                        ->label(__('core::inventory.product'))
                        ->options(fn (): array => InventoryDirectory::productOptions(activeOnly: true))
                        ->searchable()
                        ->preload()
                        ->required()
                        // Past movements recorded this product and branch, so
                        // re-pointing the row would make that history a lie.
                        // Replace the row instead of re-identifying it.
                        ->disabled(fn (?Inventory $record): bool => $record instanceof Inventory)
                        ->helperText(fn (?Inventory $record): string => $record instanceof Inventory
                            ? __('core::inventory.identity_locked_hint')
                            : ''),
                    Select::make('branch_id')
                        ->label(__('core::inventory.branch'))
                        ->options(fn (): array => InventoryDirectory::branchOptions())
                        ->searchable()
                        ->preload()
                        ->required()
                        ->disabled(fn (?Inventory $record): bool => $record instanceof Inventory),
                    TextInput::make('quantity')
                        // On create this is the opening balance; on edit it is the
                        // counted quantity, and the difference becomes an adjustment.
                        ->label(fn (?Inventory $record): string => $record instanceof Inventory
                            ? __('core::inventory.new_quantity')
                            : __('core::inventory.opening_quantity'))
                        ->numeric()
                        ->minValue(0)
                        ->default(0)
                        ->required()
                        ->helperText(__('core::inventory.quantity_writes_ledger_hint')),
                    TextInput::make('reserved_quantity')
                        ->label(__('core::inventory.reserved_quantity'))
                        ->numeric()
                        ->minValue(0)
                        ->default(0)
                        ->required(),
                    Textarea::make('notes')
                        ->label(fn (?Inventory $record): string => $record instanceof Inventory
                            ? __('core::inventory.reason')
                            : __('core::inventory.notes'))
                        ->rows(2)
                        ->columnSpanFull()
                        ->helperText(__('core::inventory.opening_notes_hint')),
                ]),
        ]);
    }

    /**
     * Movements and the purchase that credited a row outlive the row itself, so
     * a stock row is emptied by adjusting it to zero rather than deleted.
     */
    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListInventories::route('/'),
            'create' => CreateInventory::route('/create'),
            'edit' => EditInventory::route('/{record}/edit'),
        ];
    }

    /**
     * `status` is derived from the quantity and the product's threshold, not
     * stored, so sorting by it means repeating the comparison in the query.
     *
     * @return \Closure(Builder): Builder
     */
    private static function sortByStatus(): \Closure
    {
        return fn (Builder $query): Builder => $query
            ->leftJoin('products', 'products.id', '=', 'inventories.product_id')
            ->orderByRaw('CASE
                WHEN inventories.quantity <= 0 THEN 0
                WHEN inventories.quantity <= products.low_stock_threshold THEN 1
                ELSE 2
            END');
    }
}
