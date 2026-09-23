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
use UnitEnum;

class CatalogServiceResource extends Resource
{
    protected static ?string $model = CatalogService::class;

    protected static ?string $navigationLabel = 'Service types';

    protected static ?string $modelLabel = 'catalog service';

    protected static ?string $slug = 'catalog-services';

    protected static UnitEnum|string|null $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedScissors;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Select::make('catalog_service_category_id')
                    ->label('Category')
                    ->options(fn (): array => CatalogServiceCategory::query()->pluck('name', 'id')->all())
                    ->searchable()
                    ->required(),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Textarea::make('description'),
                TextInput::make('default_duration')
                    ->numeric()
                    ->suffix('min')
                    ->required(),
                TextInput::make('default_price')
                    ->numeric()
                    ->required(),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('category.name')
                    ->label('Category')
                    ->sortable(),
                TextColumn::make('default_duration')
                    ->suffix(' min'),
                TextColumn::make('default_price'),
                IconColumn::make('is_active')
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
