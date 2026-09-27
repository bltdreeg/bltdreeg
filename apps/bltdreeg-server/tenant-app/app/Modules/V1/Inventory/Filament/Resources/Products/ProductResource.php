<?php

namespace App\Modules\V1\Inventory\Filament\Resources\Products;

use App\Modules\V1\Inventory\Filament\Resources\Products\Pages\CreateProduct;
use App\Modules\V1\Inventory\Filament\Resources\Products\Pages\EditProduct;
use App\Modules\V1\Inventory\Filament\Resources\Products\Pages\ListProducts;
use App\Modules\V1\Inventory\Filament\Resources\Products\Pages\ViewProduct;
use App\Modules\V1\Inventory\Filament\Resources\Products\RelationManagers\StockRelationManager;
use App\Modules\V1\Inventory\Filament\Resources\Products\RelationManagers\TransactionsRelationManager;
use App\Modules\V1\Inventory\Support\InventoryDirectory;
use App\Modules\V1\Inventory\Support\InventoryPresenter;
use BackedEnum;
use Bltdreeg\Core\Modules\Inventory\Enums\UnitEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $slug = 'products';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShoppingBag;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::inventory.inventory');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::inventory.products');
    }

    public static function getModelLabel(): string
    {
        return __('core::inventory.product');
    }

    public static function getPluralModelLabel(): string
    {
        return __('core::inventory.products');
    }

    /**
     * `inventories` is eager loaded because the stock columns read it directly;
     * without it each row would sum with its own query.
     */
    public static function getEloquentQuery(): Builder
    {
        return InventoryDirectory::scopeToTenant(parent::getEloquentQuery())
            ->with(['category', 'inventories']);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make(__('core::inventory.details'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')
                            ->label(__('core::global.name'))
                            ->required()
                            ->maxLength(255),
                        Select::make('category_id')
                            ->label(__('core::inventory.category'))
                            ->options(fn (): array => InventoryDirectory::categoryOptions(activeOnly: true))
                            ->searchable()
                            ->preload()
                            ->placeholder('—'),
                        // SKU and barcode are unique per tenant, not globally, and a
                        // plain `unique` rule bypasses global scopes — so the
                        // tenant has to be part of the check or one salon could
                        // block another's SKU.
                        TextInput::make('sku')
                            ->label(__('core::inventory.sku'))
                            ->maxLength(255)
                            ->unique(
                                ignoreRecord: true,
                                modifyRuleUsing: fn ($rule) => $rule->where('tenant_id', InventoryDirectory::tenantId()),
                            ),
                        TextInput::make('barcode')
                            ->label(__('core::inventory.barcode'))
                            ->maxLength(255)
                            ->unique(
                                ignoreRecord: true,
                                modifyRuleUsing: fn ($rule) => $rule->where('tenant_id', InventoryDirectory::tenantId()),
                            ),
                    ]),
                Section::make(__('core::inventory.pricing'))
                    ->columnSpanFull()
                    ->columns(3)
                    ->schema([
                        TextInput::make('price')
                            ->label(__('core::inventory.price'))
                            ->numeric()
                            ->minValue(0)
                            ->default(0)
                            ->required(),
                        TextInput::make('sale_price')
                            ->label(__('core::inventory.sale_price'))
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(fn (Get $get): mixed => $get('price'))
                            ->helperText(__('core::inventory.sale_price_hint')),
                        Select::make('unit')
                            ->label(__('core::inventory.unit'))
                            ->options(UnitEnum::options())
                            ->default(UnitEnum::PIECE->value)
                            ->searchable()
                            ->required(),
                    ]),
                Section::make(__('core::inventory.stock'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextInput::make('low_stock_threshold')
                            ->label(__('core::inventory.low_stock_threshold'))
                            ->numeric()
                            ->integer()
                            ->minValue(0)
                            ->default(0)
                            ->helperText(__('core::inventory.low_stock_threshold_hint')),
                        Toggle::make('track_inventory')
                            ->label(__('core::inventory.track_inventory'))
                            ->helperText(__('core::inventory.track_inventory_hint'))
                            ->default(true),
                    ]),
                Section::make()
                    ->columnSpanFull()
                    ->schema([
                        FileUpload::make('image')
                            ->label(__('core::inventory.image'))
                            ->image()
                            ->columnSpanFull()
                            ->directory('inventory/products'),
                        Textarea::make('description')
                            ->label(__('core::global.description'))
                            ->rows(3),
                        Toggle::make('is_active')
                            ->label(__('core::global.is_active'))
                            ->default(true),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label(__('core::global.name'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('category.name')
                    ->label(__('core::inventory.category'))
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('sku')
                    ->label(__('core::inventory.sku'))
                    ->searchable()
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('barcode')
                    ->label(__('core::inventory.barcode'))
                    ->searchable()
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('total_stock')
                    ->label(__('core::inventory.total_stock'))
                    ->state(fn (Product $record): string => InventoryPresenter::quantity($record->totalStock()))
                    ->suffix(fn (Product $record): string => ' '.$record->unit?->label())
                    ->sortable(query: self::sortByTotalStock())
                    ->badge()
                    ->color(fn (Product $record): string => match (true) {
                        ! $record->track_inventory => 'gray',
                        $record->isOutOfStock() => 'danger',
                        $record->isLowStock() => 'warning',
                        default => 'success',
                    })
                    ->description(fn (Product $record): string => $record->track_inventory
                        ? __('core::inventory.low_stock_threshold_value', ['value' => $record->low_stock_threshold])
                        : __('core::inventory.product_not_tracked')),
                ImageColumn::make('image')
                    ->label(__('core::inventory.image'))
                    ->circular()
                    ->placeholder('—'),
                TextColumn::make('price')
                    ->label(__('core::inventory.price'))
                    ->formatStateUsing(fn ($state, Product $record): string => $record->isOnSale()
                        ? '<s>'.InventoryPresenter::money($state).'</s>'
                        : InventoryPresenter::money($state))
                    ->html()
                    ->sortable(),
                TextColumn::make('sale_price')
                    ->label(__('core::inventory.sale_price'))
                    ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state))
                    ->placeholder('—')
                    ->sortable()
                    ->toggleable(),
                IconColumn::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->boolean(),
                TextColumn::make('created_at')
                    ->label(__('core::global.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category_id')
                    ->label(__('core::inventory.category'))
                    ->options(fn (): array => InventoryDirectory::categoryOptions())
                    ->searchable()
                    ->preload(),
                TernaryFilter::make('is_active')
                    ->label(__('core::global.is_active')),
                TernaryFilter::make('track_inventory')
                    ->label(__('core::inventory.track_inventory')),
                Filter::make('low_stock')
                    ->label(__('core::inventory.low_stock'))
                    ->query(fn (Builder $query): Builder => $query->whereHas(
                        'inventories',
                        fn (Builder $query): Builder => $query->whereColumn(
                            'inventories.quantity',
                            '<=',
                            'products.low_stock_threshold',
                        ),
                    )),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    Action::make('activate')
                        ->label(__('core::inventory.activate'))
                        ->color('success')
                        ->requiresConfirmation()
                        ->authorize('Update:Product')
                        ->deselectRecordsAfterCompletion()
                        ->action(fn (Collection $records) => $records->each->update(['is_active' => true])),
                    Action::make('deactivate')
                        ->label(__('core::inventory.deactivate'))
                        ->color('warning')
                        ->requiresConfirmation()
                        ->authorize('Update:Product')
                        ->deselectRecordsAfterCompletion()
                        ->action(fn (Collection $records) => $records->each->update(['is_active' => false])),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make(__('core::inventory.details'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextEntry::make('name')
                            ->label(__('core::global.name'))
                            ->columnSpanFull(),
                        TextEntry::make('category.name')
                            ->label(__('core::inventory.category'))
                            ->placeholder('—'),
                        TextEntry::make('sku')
                            ->label(__('core::inventory.sku'))
                            ->placeholder('—'),
                        TextEntry::make('barcode')
                            ->label(__('core::inventory.barcode'))
                            ->placeholder('—'),
                        ImageEntry::make('image')
                            ->label(__('core::inventory.image'))
                            ->columnSpanFull()
                            ->placeholder('—'),
                        TextEntry::make('description')
                            ->label(__('core::global.description'))
                            ->placeholder('—')
                            ->columnSpanFull(),
                    ]),
                Section::make(__('core::inventory.pricing'))
                    ->columnSpanFull()
                    ->columns(3)
                    ->schema([
                        TextEntry::make('price')
                            ->label(__('core::inventory.price'))
                            ->formatStateUsing(fn ($state, Product $record): string => $record->isOnSale()
                                ? '<s>'.InventoryPresenter::money($state).'</s>'
                                : InventoryPresenter::money($state))
                            ->html(),
                        TextEntry::make('sale_price')
                            ->label(__('core::inventory.sale_price'))
                            ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state))
                            ->placeholder('—')
                            ->badge()
                            ->color(fn (Product $record): string => $record->isOnSale() ? 'danger' : 'gray'),
                        TextEntry::make('unit')
                            ->label(__('core::inventory.unit'))
                            ->formatStateUsing(fn (UnitEnum $state): string => $state->label())
                            ->placeholder('—'),
                        TextEntry::make('is_active')
                            ->label(__('core::global.is_active'))
                            ->badge()
                            ->color(fn (bool $state): string => $state ? 'success' : 'gray'),
                    ]),
                Section::make(__('core::inventory.stock'))
                    ->columnSpanFull()
                    ->columns(3)
                    ->schema([
                        TextEntry::make('total_stock')
                            ->label(__('core::inventory.total_stock'))
                            ->state(fn (Product $record): string => InventoryPresenter::quantityWithUnit($record->totalStock(), $record->unit)),
                        TextEntry::make('available_stock')
                            ->label(__('core::inventory.available_quantity'))
                            ->state(fn (Product $record): string => InventoryPresenter::quantityWithUnit($record->availableStock(), $record->unit)),
                        TextEntry::make('reserved_stock')
                            ->label(__('core::inventory.reserved_quantity'))
                            ->state(fn (Product $record): string => InventoryPresenter::quantityWithUnit($record->totalReserved(), $record->unit)),
                        TextEntry::make('low_stock_threshold')
                            ->label(__('core::inventory.low_stock_threshold')),
                        IconEntry::make('track_inventory')
                            ->label(__('core::inventory.track_inventory'))
                            ->boolean(),
                    ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            StockRelationManager::class,
            TransactionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListProducts::route('/'),
            'create' => CreateProduct::route('/create'),
            'view' => ViewProduct::route('/{record}'),
            'edit' => EditProduct::route('/{record}/edit'),
        ];
    }

    /**
     * Total stock is a sum across `inventories`, not a column on `products`, so
     * ordering by it needs the aggregate projected into the products query.
     *
     * @return \Closure(Builder): Builder
     */
    private static function sortByTotalStock(): \Closure
    {
        return fn (Builder $query): Builder => $query
            ->addSelect([
                'total_stock' => Inventory::query()
                    ->selectRaw('COALESCE(SUM(quantity), 0)')
                    ->whereColumn('inventories.product_id', 'products.id')
                    ->whereColumn('inventories.tenant_id', 'products.tenant_id'),
            ])
            ->orderBy('total_stock');
    }
}
