<?php

namespace App\Modules\V1\Services\Filament\Resources\Services;

use App\Modules\V1\Services\Filament\Resources\Services\Pages\CreateService;
use App\Modules\V1\Services\Filament\Resources\Services\Pages\EditService;
use App\Modules\V1\Services\Filament\Resources\Services\Pages\ListServices;
use App\Modules\V1\Services\Models\Service;
use App\Modules\V1\Services\Models\ServiceCategory;
use BackedEnum;
use Bltdreeg\Core\Modules\Geo\Support\CurrencyResolver;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
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

class ServiceResource extends Resource
{
    use Translatable;

    protected static ?string $model = Service::class;

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedScissors;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::services.services');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::services.services');
    }

    public static function getModelLabel(): string
    {
        return __('core::services.service');
    }

    public static function getPluralModelLabel(): string
    {
        return __('core::services.services');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Select::make('category_id')
                    ->label(__('core::services.category'))
                    ->options(fn (): array => ServiceCategory::query()->pluck('name', 'id')->all())
                    ->searchable()
                    ->required(),
                TextInput::make('name')
                    ->label(__('core::global.name'))
                    ->required()
                    ->maxLength(255),
                Textarea::make('description')
                    ->label(__('core::global.description')),
                TextInput::make('duration')
                    ->label(__('core::services.duration'))
                    ->numeric()
                    ->suffix(__('core::services.minutes_suffix'))
                    ->required(),
                TextInput::make('price')
                    ->label(__('core::services.price'))
                    ->numeric()
                    ->required(),
                Select::make('currency')
                    ->label(__('core::services.currency'))
                    ->options(CurrencyEnum::class)
                    ->default(CurrencyResolver::DEFAULT)
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
                TextColumn::make('duration')
                    ->label(__('core::services.duration'))
                    ->suffix(' '.__('core::services.minutes_suffix')),
                TextColumn::make('price')
                    ->label(__('core::services.price'))
                    ->sortable(),
                TextColumn::make('currency')
                    ->label(__('core::services.currency'))
                    ->formatStateUsing(fn (CurrencyEnum $state): string => $state->name),
                IconColumn::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->boolean(),
                IconColumn::make('catalog_service_id')
                    ->label(__('core::services.catalog'))
                    ->boolean()
                    ->getStateUsing(fn (Service $record): bool => $record->isFromCatalog()),
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
            'index' => ListServices::route('/'),
            'create' => CreateService::route('/create'),
            'edit' => EditService::route('/{record}/edit'),
        ];
    }
}
