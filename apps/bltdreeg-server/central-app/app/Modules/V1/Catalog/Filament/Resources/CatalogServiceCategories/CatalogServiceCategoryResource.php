<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\Pages\CreateCatalogServiceCategory;
use App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\Pages\EditCatalogServiceCategory;
use App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\Pages\ListCatalogServiceCategories;
use BackedEnum;
use Bltdreeg\Core\Models\CatalogServiceCategory;
use Filament\Actions\BulkActionGroup;
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
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class CatalogServiceCategoryResource extends Resource
{
    protected static ?string $model = CatalogServiceCategory::class;

    protected static ?string $navigationLabel = 'Service categories';

    protected static ?string $modelLabel = 'catalog category';

    protected static ?string $slug = 'catalog-categories';

    protected static UnitEnum|string|null $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTag;

    public static function canViewAny(): bool
    {
        return Auth::user()?->is_super_admin ?? false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Textarea::make('description'),
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
                TextColumn::make('description')
                    ->limit(40),
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
            'index' => ListCatalogServiceCategories::route('/'),
            'create' => CreateCatalogServiceCategory::route('/create'),
            'edit' => EditCatalogServiceCategory::route('/{record}/edit'),
        ];
    }
}
