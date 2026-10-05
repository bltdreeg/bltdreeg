<?php

namespace App\Modules\V1\Branches\Filament\Resources\Branches;

use App\Modules\V1\Branches\Filament\Resources\Branches\Pages\CreateBranch;
use App\Modules\V1\Branches\Filament\Resources\Branches\Pages\EditBranch;
use App\Modules\V1\Branches\Filament\Resources\Branches\Pages\ListBranches;
use BackedEnum;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use LaraZeus\SpatieTranslatable\Resources\Concerns\Translatable;

class BranchResource extends Resource
{
    use Translatable;

    protected static ?string $model = Branch::class;

    protected static ?string $slug = 'branches';

    protected static ?int $navigationSort = 5;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingStorefront;

    public static function getNavigationGroup(): string
    {
        return __('core::global.administration');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::branches.branches');
    }

    public static function getLabel(): string
    {
        return __('core::branches.branch');
    }

    public static function getPluralLabel(): string
    {
        return __('core::branches.branches');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Select::make('tenant_id')
                    ->label(__('core::tenants.tenant'))
                    ->options(fn (): array => Tenant::query()->pluck('name', 'id')->all())
                    ->searchable()
                    ->required(),
                TextInput::make('name')
                    ->label(__('core::global.name'))
                    ->required()
                    ->maxLength(255),
                TextInput::make('phone')
                    ->label(__('core::global.phone'))
                    ->tel()
                    ->maxLength(255),
                TextInput::make('address')
                    ->label(__('core::global.address'))
                    ->maxLength(255),
                Grid::make(3)->schema([
                    Select::make('governorate_id')
                        ->label(__('core::geo.governorate'))
                        ->options(fn (): array => GeoGovernorate::options())
                        ->searchable()
                        ->required()
                        ->live()
                        ->afterStateUpdated(function (Set $set): void {
                            $set('city_id', null);
                            $set('area_id', null);
                        }),
                    Select::make('city_id')
                        ->label(__('core::geo.city'))
                        ->options(fn (Get $get): array => GeoCity::optionsFor($get('governorate_id')))
                        ->searchable()
                        ->required()
                        ->live()
                        ->afterStateUpdated(fn (Set $set) => $set('area_id', null)),
                    Select::make('area_id')
                        ->label(__('core::geo.area'))
                        ->options(fn (Get $get): array => GeoArea::optionsFor($get('city_id')))
                        ->searchable()
                        ->required()
                        ->live()
                        ->afterStateUpdated(function (Get $get, Set $set, ?string $state): void {
                            if (blank($state)) {
                                return;
                            }

                            $lat = is_numeric($get('latitude')) ? (float) $get('latitude') : null;
                            $lng = is_numeric($get('longitude')) ? (float) $get('longitude') : null;
                            $location = app(LocationResolver::class)->forArea($state, $lat, $lng, LocationSourceEnum::Manual);

                            $set('latitude', $location->lat);
                            $set('longitude', $location->lng);
                            $set('location_source', $location->source->value);
                        }),
                ])->columnSpanFull(),
                TextInput::make('latitude')
                    ->label(__('core::branches.latitude'))
                    ->numeric()
                    ->required()
                    ->minValue(EgyptBounds::LAT[0])
                    ->maxValue(EgyptBounds::LAT[1]),
                TextInput::make('longitude')
                    ->label(__('core::branches.longitude'))
                    ->numeric()
                    ->required()
                    ->minValue(EgyptBounds::LNG[0])
                    ->maxValue(EgyptBounds::LNG[1]),
                Hidden::make('location_source')
                    ->default(LocationSourceEnum::Manual->value),
                Toggle::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('tenant.name')
                    ->label(__('core::tenants.tenant'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('name')
                    ->label(__('core::global.name'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('phone')
                    ->label(__('core::global.phone'))
                    ->searchable(),
                TextColumn::make('address')
                    ->label(__('core::global.address'))
                    ->limit(40),
                TextColumn::make('city.name')
                    ->label(__('core::geo.city'))
                    ->formatStateUsing(fn (Branch $record): string => $record->city->getTranslation('name', app()->getLocale())),
                IconColumn::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->boolean(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
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
            'index' => ListBranches::route('/'),
            'create' => CreateBranch::route('/create'),
            'edit' => EditBranch::route('/{record}/edit'),
        ];
    }
}
