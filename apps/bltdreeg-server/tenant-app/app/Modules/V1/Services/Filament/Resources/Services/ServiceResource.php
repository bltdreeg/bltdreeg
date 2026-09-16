<?php

namespace App\Modules\V1\Services\Filament\Resources\Services;

use App\Modules\V1\Services\Filament\Resources\Services\Pages\CreateService;
use App\Modules\V1\Services\Filament\Resources\Services\Pages\EditService;
use App\Modules\V1\Services\Filament\Resources\Services\Pages\ListServices;
use App\Modules\V1\Services\Models\Service;
use App\Modules\V1\Services\Models\ServiceCategory;
use BackedEnum;
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

class ServiceResource extends Resource
{
    protected static ?string $model = Service::class;

    protected static ?string $navigationLabel = 'Services';

    protected static UnitEnum|string|null $navigationGroup = 'Services';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedScissors;

    protected static bool $isScopedToTenant = false;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Select::make('category_id')
                    ->label('Category')
                    ->options(fn (): array => ServiceCategory::query()->pluck('name', 'id')->all())
                    ->searchable()
                    ->required(),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Textarea::make('description'),
                TextInput::make('duration')
                    ->numeric()
                    ->suffix('min')
                    ->required(),
                TextInput::make('price')
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
                TextColumn::make('duration')
                    ->suffix(' min'),
                TextColumn::make('price')
                    ->sortable(),
                IconColumn::make('is_active')
                    ->boolean(),
                IconColumn::make('catalog_service_id')
                    ->label('Catalog')
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
