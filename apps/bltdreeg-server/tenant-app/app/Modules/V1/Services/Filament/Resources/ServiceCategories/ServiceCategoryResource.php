<?php

namespace App\Modules\V1\Services\Filament\Resources\ServiceCategories;

use App\Modules\V1\Services\Filament\Resources\ServiceCategories\Pages\CreateServiceCategory;
use App\Modules\V1\Services\Filament\Resources\ServiceCategories\Pages\EditServiceCategory;
use App\Modules\V1\Services\Filament\Resources\ServiceCategories\Pages\ListServiceCategories;
use App\Modules\V1\Services\Models\ServiceCategory;
use BackedEnum;
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
use LaraZeus\SpatieTranslatable\Resources\Concerns\Translatable;

class ServiceCategoryResource extends Resource
{
    use Translatable;

    protected static ?string $model = ServiceCategory::class;

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTag;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::services.services');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::services.categories');
    }

    public static function getModelLabel(): string
    {
        return __('core::services.category');
    }

    public static function getPluralModelLabel(): string
    {
        return __('core::services.categories');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->label(__('core::global.name'))
                    ->required()
                    ->maxLength(255),
                Textarea::make('description')
                    ->label(__('core::global.description')),
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
                    ->limit(40),
                IconColumn::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->boolean(),
                IconColumn::make('catalog_service_category_id')
                    ->label(__('core::services.catalog'))
                    ->boolean()
                    ->getStateUsing(fn (ServiceCategory $record): bool => $record->isFromCatalog()),
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
            'index' => ListServiceCategories::route('/'),
            'create' => CreateServiceCategory::route('/create'),
            'edit' => EditServiceCategory::route('/{record}/edit'),
        ];
    }
}
