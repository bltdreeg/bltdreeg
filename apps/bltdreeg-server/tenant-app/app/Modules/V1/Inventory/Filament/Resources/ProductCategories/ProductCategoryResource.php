<?php

namespace App\Modules\V1\Inventory\Filament\Resources\ProductCategories;

use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages\CreateProductCategory;
use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages\EditProductCategory;
use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages\ListProductCategories;
use App\Modules\V1\Inventory\Support\InventoryDirectory;
use BackedEnum;
use Bltdreeg\Core\Modules\Inventory\Models\ProductCategory;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ProductCategoryResource extends Resource
{
    protected static ?string $model = ProductCategory::class;

    protected static ?string $slug = 'product-categories';

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTag;

    /**
     * Tenant scoping comes from the `BelongsToTenant` global scope plus the
     * explicit filter in getEloquentQuery(), not from Filament's tenant
     * relationship, which is why this is false everywhere in this module.
     */
    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::inventory.inventory');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::inventory.product_categories');
    }

    public static function getModelLabel(): string
    {
        return __('core::inventory.product_category');
    }

    public static function getPluralModelLabel(): string
    {
        return __('core::inventory.product_categories');
    }

    public static function getEloquentQuery(): Builder
    {
        return InventoryDirectory::scopeToTenant(parent::getEloquentQuery())
            ->withCount('products');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->label(__('core::global.name'))
                    ->required()
                    ->columnSpanFull()
                    ->maxLength(255),
                Textarea::make('description')
                    ->label(__('core::global.description'))
                    ->rows(3)
                    ->columnSpanFull(),
                Toggle::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->default(true),
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
                TextColumn::make('description')
                    ->label(__('core::global.description'))
                    ->limit(40)
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('products_count')
                    ->label(__('core::inventory.products'))
                    ->counts('products')
                    ->sortable(),
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
                TernaryFilter::make('is_active')
                    ->label(__('core::global.is_active')),
                Filter::make('without_products')
                    ->label(__('core::inventory.empty_category'))
                    ->query(fn (Builder $query): Builder => $query->doesntHave('products')),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()
                    // products.category_id is nullOnDelete, so removing a
                    // category leaves its products uncategorised rather than
                    // deleting them. Say so before the user clicks.
                    ->requiresConfirmation()
                    ->modalHeading(fn (ProductCategory $record): string => $record->products_count > 0
                        ? __('core::inventory.delete_category_with_products', ['count' => $record->products_count])
                        : __('core::inventory.delete_category')),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListProductCategories::route('/'),
            'create' => CreateProductCategory::route('/create'),
            'edit' => EditProductCategory::route('/{record}/edit'),
        ];
    }
}
