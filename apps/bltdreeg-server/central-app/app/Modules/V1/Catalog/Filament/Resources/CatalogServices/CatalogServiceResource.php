<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServices;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\Pages\CreateCatalogService;
use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\Pages\EditCatalogService;
use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\Pages\ListCatalogServices;
use BackedEnum;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use LaraZeus\SpatieTranslatable\Resources\Concerns\Translatable;

class CatalogServiceResource extends Resource
{
    use Translatable;

    protected static ?string $model = CatalogService::class;

    protected static ?string $slug = 'catalog-services';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedScissors;

    public static function getNavigationGroup(): string
    {
        return __('core::services.catalog');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::services.service_types');
    }

    public static function getModelLabel(): string
    {
        return __('core::services.catalog_service');
    }

    public static function getPluralModelLabel(): string
    {
        return __('core::services.catalog_services');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Select::make('catalog_service_category_id')
                    ->label(__('core::services.category'))
                    ->options(fn (): array => CatalogServiceCategory::query()->pluck('name', 'id')->all())
                    ->searchable()
                    ->required(),
                TextInput::make('name')
                    ->label(__('core::global.name'))
                    ->required()
                    ->maxLength(255),
                Textarea::make('description')
                    ->label(__('core::global.description')),
                TextInput::make('default_duration')
                    ->label(__('core::services.default_duration'))
                    ->numeric()
                    ->suffix(__('core::services.minutes_suffix'))
                    ->required(),
                TextInput::make('default_price')
                    ->label(__('core::services.default_price'))
                    ->numeric()
                    ->required(),
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
                TextColumn::make('category.name')
                    ->label(__('core::services.category'))
                    ->sortable(),
                TextColumn::make('default_duration')
                    ->label(__('core::services.default_duration'))
                    ->suffix(' '.__('core::services.minutes_suffix')),
                TextColumn::make('default_price')
                    ->label(__('core::services.default_price')),
                IconColumn::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->boolean(),
            ])
            ->recordActions([
                EditAction::make(),
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
            'index' => ListCatalogServices::route('/'),
            'create' => CreateCatalogService::route('/create'),
            'edit' => EditCatalogService::route('/{record}/edit'),
        ];
    }
}
