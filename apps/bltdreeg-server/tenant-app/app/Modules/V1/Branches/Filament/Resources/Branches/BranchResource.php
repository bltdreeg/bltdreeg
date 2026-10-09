<?php

namespace App\Modules\V1\Branches\Filament\Resources\Branches;

use App\Modules\V1\Branches\Filament\Resources\Branches\Pages\CreateBranch;
use App\Modules\V1\Branches\Filament\Resources\Branches\Pages\EditBranch;
use App\Modules\V1\Branches\Filament\Resources\Branches\Pages\ListBranches;
use App\Modules\V1\Branches\Support\BranchImages;
use BackedEnum;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Bltdreeg\Core\Modules\Geo\Support\GoogleMapsLinkResolver;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Bltdreeg\Core\Modules\Onboarding\Enums\ServiceLocationTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;
use LaraZeus\SpatieTranslatable\Resources\Concerns\Translatable;
use Ysfkaya\FilamentPhoneInput\Forms\PhoneInput;

class BranchResource extends Resource
{
    use Translatable;

    protected static ?string $model = Branch::class;

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingStorefront;

    protected static bool $isScopedToTenant = false;

    public static function getEloquentQuery(): Builder
    {
        $tenantId = Filament::getTenant()?->getKey();

        return parent::getEloquentQuery()
            ->withoutGlobalScope('branch')
            ->when(
                $tenantId !== null,
                fn (Builder $query): Builder => $query->where(
                    $query->getModel()->qualifyColumn('tenant_id'),
                    $tenantId,
                ),
            );
    }

    public static function getNavigationGroup(): string
    {
        return __('core::global.operations');
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
                TextInput::make('name')
                    ->label(__('core::global.name'))
                    ->required()
                    ->maxLength(255),
                PhoneInput::make('phone')
                    ->label(__('core::global.phone'))
                    ->initialCountry('eg')
                    ->defaultCountry('EG')
                    ->disableLookup()
                    ->separateDialCode()
                    ->countrySearch()
                    ->locale(app()->getLocale())
                    ->extraAttributes(['dir' => 'ltr'])
                    ->validateFor(lenient: true)
                    ->validationMessages(['phone' => __('core::onboarding.register.phone_invalid')]),
                Radio::make('team_size')
                    ->label(__('core::onboarding.wizard.team_size'))
                    ->options(TeamSizeEnum::options())
                    ->in(array_keys(TeamSizeEnum::options()))
                    ->required(),
                CheckboxList::make('service_location_type')
                    ->label(__('core::onboarding.wizard.service_location_type'))
                    ->options(ServiceLocationTypeEnum::options())
                    ->in(array_keys(ServiceLocationTypeEnum::options()))
                    ->required()
                    ->live()
                    ->bulkToggleable(false),
                TextInput::make('address')
                    ->label(__('core::global.address'))
                    ->maxLength(255)
                    ->required(fn (Get $get): bool => ServiceLocationTypeEnum::selectionRequiresAddress($get('service_location_type') ?? [])),
                TextInput::make('maps_url')
                    ->label(__('core::onboarding.wizard.maps_url'))
                    ->placeholder(__('core::onboarding.wizard.maps_url_placeholder'))
                    ->url()
                    ->maxLength(500),
                Select::make('governorate_id')
                    ->label(__('core::geo.governorate'))
                    ->options(fn (): array => GeoGovernorate::options())
                    ->searchable()
                    ->required()
                    ->live()
                    ->afterStateUpdated(fn (Set $set) => $set('city_id', null)),
                Select::make('city_id')
                    ->label(__('core::geo.city'))
                    ->options(fn (Get $get): array => GeoCity::optionsFor($get('governorate_id')))
                    ->searchable()
                    ->required(),
                ...BranchImages::fields(),
                Toggle::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->default(true),
            ]);
    }

    /**
     * A new Google Maps link wins: its point decides governorate and city. Otherwise the owner only
     * picks governorate and city, and the map point follows the city. A branch whose city did not
     * change keeps its precise point.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     *
     * @throws ValidationException when the maps link has no readable location in Egypt
     */
    public static function withResolvedLocation(array $data, ?Branch $record = null): array
    {
        $data = BranchImages::resolve($data);

        $mapsUrl = trim((string) ($data['maps_url'] ?? ''));
        $data['maps_url'] = $mapsUrl === '' ? null : $mapsUrl;

        // The link is always kept, but only a new or changed one re-decides the location: after that the owner may
        // have moved the branch by picking another city.
        if ($mapsUrl !== '' && $mapsUrl !== $record?->maps_url) {
            $coordinates = app(GoogleMapsLinkResolver::class)->resolve($mapsUrl);

            if ($coordinates === null) {
                throw ValidationException::withMessages(['data.maps_url' => __('core::onboarding.wizard.maps_url_invalid')]);
            }

            $location = app(LocationResolver::class)->nearest($coordinates->lat, $coordinates->lng, LocationSourceEnum::MapsUrl);

            return [...$data, ...$location->toBranchColumns()];
        }

        $cityId = $data['city_id'] ?? null;

        if (blank($cityId) || ($record !== null && $record->city_id === $cityId && filled($record->latitude))) {
            return $data;
        }

        $location = app(LocationResolver::class)->forCity(
            (string) $cityId,
            $record?->latitude === null ? null : (float) $record->latitude,
            $record?->longitude === null ? null : (float) $record->longitude,
            LocationSourceEnum::tryFrom((string) $record?->location_source) ?? LocationSourceEnum::Manual,
        );

        return [...$data, ...$location->toBranchColumns()];
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
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
                TextColumn::make('currency')
                    ->label(__('core::branches.currency'))
                    ->formatStateUsing(fn (CurrencyEnum $state): string => $state->name),
                IconColumn::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->boolean(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
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
