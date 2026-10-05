<?php

namespace App\Modules\V1\Onboarding\Filament\Pages;

use App\Modules\V1\Onboarding\Services\OnboardingService;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Bltdreeg\Core\Modules\Geo\Support\GoogleMapsLinkResolver;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Bltdreeg\Core\Modules\Onboarding\Enums\LegalDocumentTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\ServiceLocationTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use DomainException;
use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Text;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Components\View;
use Filament\Schemas\Components\Wizard;
use Filament\Schemas\Components\Wizard\Step;
use Filament\Schemas\Schema;
use Filament\Support\Enums\Width;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\HtmlString;

/**
 * @property-read Schema $form
 */
class Onboarding extends Page
{
    /**
     * @var array<string, mixed> | null
     */
    public ?array $data = [];

    public bool $hasPreviousDocument = false;

    protected static string $layout = 'filament.layouts.onboarding';

    protected static ?string $slug = 'onboarding';

    protected static bool $shouldRegisterNavigation = false;

    protected Width|string|null $maxContentWidth = Width::FourExtraLarge;

    public function mount(): void
    {
        $tenant = $this->tenant();
        $service = app(OnboardingService::class);

        if (! $service->canSubmit($tenant)) {
            $this->redirect($tenant->isApproved()
                ? Filament::getUrl($tenant)
                : OnboardingStatus::getUrl(tenant: $tenant));

            return;
        }

        $this->hasPreviousDocument = $service->latestDocument($tenant) !== null;

        $this->form->fill(collect($service->prefill($tenant))
            ->only(['business_name', 'website', 'team_size', 'service_location_type', 'address', 'latitude', 'longitude', 'governorate_id', 'city_id', 'area_id', 'location_source', 'document_type'])
            ->all());

        // أول مرة: نعبّي الموقع من الـ IP (أو القاهرة الافتراضية) والمالك يأكّده أو يغيّره
        if (blank($this->data['area_id'] ?? null)) {
            $this->applyResolved(app(LocationResolver::class)->fromIp(request()->ip()));
        }
    }

    public function defaultForm(Schema $schema): Schema
    {
        return $schema->statePath('data');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Wizard::make([
                    Step::make('business')
                        ->label(__('core::onboarding.wizard.steps.business'))
                        ->schema([
                            TextInput::make('business_name')
                                ->label(__('core::onboarding.wizard.business_name'))
                                ->required()
                                ->maxLength(255),
                            TextInput::make('website')
                                ->label(__('core::onboarding.wizard.website'))
                                ->url()
                                ->maxLength(255),
                        ]),
                    Step::make('team')
                        ->label(__('core::onboarding.wizard.steps.team'))
                        ->schema([
                            Radio::make('team_size')
                                ->label(__('core::onboarding.wizard.team_size'))
                                ->options(TeamSizeEnum::options())
                                ->in(array_keys(TeamSizeEnum::options()))
                                ->required(),
                        ]),
                    Step::make('location_type')
                        ->label(__('core::onboarding.wizard.steps.location_type'))
                        ->schema([
                            CheckboxList::make('service_location_type')
                                ->label(__('core::onboarding.wizard.service_location_type'))
                                ->options(ServiceLocationTypeEnum::options())
                                ->in(array_keys(ServiceLocationTypeEnum::options()))
                                ->required()
                                ->bulkToggleable(false)
                                ->live(),
                        ]),
                    Step::make('address')
                        ->label(__('core::onboarding.wizard.location_step'))
                        ->schema([
                            Text::make(fn (Get $get): string => $this->requiresAddress($get)
                                ? __('core::onboarding.wizard.location_intro')
                                : __('core::onboarding.wizard.location_intro_area_only')),
                            Text::make(__('core::onboarding.wizard.approximate_location'))
                                ->visible(fn (Get $get): bool => in_array($get('location_source'), ['ip', 'default'], true)),
                            View::make('filament.onboarding.location-map')
                                ->visible(fn (Get $get): bool => $this->requiresAddress($get)),
                            TextInput::make('maps_url')
                                ->label(__('core::onboarding.wizard.maps_url'))
                                ->placeholder(__('core::onboarding.wizard.maps_url_placeholder'))
                                ->dehydrated(false)
                                ->visible(fn (Get $get): bool => $this->requiresAddress($get))
                                ->suffixAction(
                                    Action::make('applyMapsUrl')
                                        ->label(__('core::onboarding.wizard.maps_url_apply'))
                                        ->icon('heroicon-m-map-pin')
                                        ->action(fn () => $this->applyMapsUrl()),
                                ),
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
                                    ->afterStateUpdated(function (Set $set, ?string $state): void {
                                        $areas = GeoArea::optionsFor($state);
                                        $set('area_id', null);

                                        // مدن "خارج الزمام" ليها منطقة واحدة بس — نختارها تلقائياً
                                        if (count($areas) === 1) {
                                            $this->areaChosen((string) array_key_first($areas));
                                        }
                                    }),
                                Select::make('area_id')
                                    ->label(__('core::geo.area'))
                                    ->options(fn (Get $get): array => GeoArea::optionsFor($get('city_id')))
                                    ->searchable()
                                    ->required()
                                    ->live()
                                    ->afterStateUpdated(function (?string $state): void {
                                        if (filled($state)) {
                                            $this->areaChosen($state);
                                        }
                                    }),
                            ]),
                            Textarea::make('address')
                                ->label(__('core::onboarding.wizard.address'))
                                ->rows(2)
                                ->maxLength(500)
                                ->required(fn (Get $get): bool => $this->requiresAddress($get))
                                ->visible(fn (Get $get): bool => $this->requiresAddress($get)),
                            Hidden::make('latitude')->required(),
                            Hidden::make('longitude')->required(),
                            Hidden::make('location_source')->required(),
                        ]),
                    Step::make('document')
                        ->label(__('core::onboarding.wizard.steps.document'))
                        ->schema([
                            Text::make(__('core::onboarding.wizard.document_on_file'))
                                ->visible(fn (): bool => $this->hasPreviousDocument),
                            Select::make('document_type')
                                ->label(__('core::onboarding.wizard.document_type'))
                                ->options(LegalDocumentTypeEnum::options())
                                ->in(array_keys(LegalDocumentTypeEnum::options()))
                                ->required(),
                            FileUpload::make('document_file')
                                ->label(__('core::onboarding.wizard.document_file'))
                                ->helperText(__('core::onboarding.wizard.document_helper'))
                                ->disk(TenantLegalDocument::DISK)
                                ->directory(fn (): string => 'tenants/'.$this->tenant()->getKey())
                                ->visibility('private')
                                ->acceptedFileTypes(['image/jpeg', 'image/png', 'application/pdf'])
                                ->maxSize(5120)
                                ->storeFileNamesIn('document_original_filename')
                                ->previewable(false)
                                ->required(fn (): bool => ! $this->hasPreviousDocument),
                        ]),
                    Step::make('review')
                        ->label(__('core::onboarding.wizard.steps.review'))
                        ->schema([
                            Text::make(__('core::onboarding.wizard.review_intro')),
                            ...$this->reviewEntries(),
                        ]),
                ])
                    ->submitAction(new HtmlString(Blade::render(
                        '<x-filament::button type="submit">{{ $label }}</x-filament::button>',
                        ['label' => __('core::onboarding.wizard.submit')],
                    ))),
            ]);
    }

    public function content(Schema $schema): Schema
    {
        return $schema
            ->components([
                Form::make([EmbeddedSchema::make('form')])
                    ->id('form')
                    ->livewireSubmitHandler('submit'),
            ]);
    }

    public function submit(): void
    {
        $tenant = $this->tenant();

        /** @var User $user */
        $user = Filament::auth()->user();

        $data = $this->form->getState();

        try {
            app(OnboardingService::class)->submit(
                $tenant,
                $user,
                $data,
                $data['document_file'] ?? null,
                $data['document_original_filename'] ?? null,
            );
        } catch (DomainException) {
            Notification::make()
                ->title(__('core::onboarding.wizard.not_available'))
                ->danger()
                ->send();

            $this->redirect(OnboardingStatus::getUrl(tenant: $tenant));

            return;
        }

        Notification::make()
            ->title(__('core::onboarding.wizard.submitted'))
            ->success()
            ->send();

        $this->redirect(OnboardingStatus::getUrl(tenant: $tenant));
    }

    public function getTitle(): string|Htmlable
    {
        return __('core::onboarding.wizard.title');
    }

    public function getHeading(): string|Htmlable
    {
        return __('core::onboarding.wizard.title');
    }

    protected function tenant(): Tenant
    {
        $tenant = Filament::getTenant();

        abort_unless(Filament::auth()->check() && $tenant instanceof Tenant, 404);

        return $tenant;
    }

    public function pinMoved(float $lat, float $lng, string $source = 'manual'): void
    {
        if (! EgyptBounds::contains($lat, $lng)) {
            Notification::make()->title(__('core::onboarding.wizard.outside_egypt'))->danger()->send();

            return;
        }

        $source = $source === 'gps' ? LocationSourceEnum::Gps : LocationSourceEnum::Manual;

        $this->applyResolved(app(LocationResolver::class)->nearest($lat, $lng, $source));
    }

    public function applyMapsUrl(): void
    {
        $this->resetErrorBag('data.maps_url');

        $coordinates = app(GoogleMapsLinkResolver::class)->resolve((string) ($this->data['maps_url'] ?? ''));

        if ($coordinates === null) {
            $this->addError('data.maps_url', __('core::onboarding.wizard.maps_url_invalid'));

            return;
        }

        $this->applyResolved(app(LocationResolver::class)->nearest($coordinates->lat, $coordinates->lng, LocationSourceEnum::MapsUrl));
    }

    public function areaChosen(string $areaId): void
    {
        $lat = is_numeric($this->data['latitude'] ?? null) ? (float) $this->data['latitude'] : null;
        $lng = is_numeric($this->data['longitude'] ?? null) ? (float) $this->data['longitude'] : null;
        $source = LocationSourceEnum::tryFromLabel($this->data['location_source'] ?? null) ?? LocationSourceEnum::Manual;

        $this->applyResolved(app(LocationResolver::class)->forArea($areaId, $lat, $lng, $source));
    }

    protected function applyResolved(ResolvedLocation $location): void
    {
        $this->data['governorate_id'] = $location->governorateId();
        $this->data['city_id'] = $location->cityId();
        $this->data['area_id'] = $location->areaId();
        $this->data['latitude'] = $location->lat;
        $this->data['longitude'] = $location->lng;
        $this->data['location_source'] = $location->source->label();
    }

    protected function requiresAddress(Get $get): bool
    {
        return ServiceLocationTypeEnum::selectionRequiresAddress($get('service_location_type'));
    }

    /**
     * @return list<TextEntry>
     */
    protected function reviewEntries(): array
    {
        return [
            TextEntry::make('review_business_name')
                ->label(__('core::onboarding.wizard.business_name'))
                ->state(fn (Get $get): ?string => $get('business_name')),
            TextEntry::make('review_website')
                ->label(__('core::onboarding.wizard.website'))
                ->state(fn (Get $get): ?string => $get('website'))
                ->placeholder('—'),
            TextEntry::make('review_team_size')
                ->label(__('core::onboarding.wizard.steps.team'))
                ->state(fn (Get $get): ?string => TeamSizeEnum::tryFrom((string) $get('team_size'))?->label()),
            TextEntry::make('review_service_location_type')
                ->label(__('core::onboarding.wizard.steps.location_type'))
                ->state(fn (Get $get): ?string => ServiceLocationTypeEnum::labels($get('service_location_type')) ?: null),
            TextEntry::make('review_location')
                ->label(__('core::geo.location'))
                ->state(fn (Get $get): ?string => collect([
                    GeoArea::query()->find($get('area_id'))?->getTranslation('name', app()->getLocale()),
                    GeoCity::query()->find($get('city_id'))?->getTranslation('name', app()->getLocale()),
                    GeoGovernorate::query()->find($get('governorate_id'))?->getTranslation('name', app()->getLocale()),
                ])->filter()->implode('، ') ?: null),
            TextEntry::make('review_address')
                ->label(__('core::onboarding.wizard.address'))
                ->state(fn (Get $get): ?string => $get('address'))
                ->visible(fn (Get $get): bool => $this->requiresAddress($get)),
            TextEntry::make('review_document')
                ->label(__('core::onboarding.wizard.steps.document'))
                ->state(fn (Get $get): ?string => collect([
                    LegalDocumentTypeEnum::tryFrom((string) $get('document_type'))?->label(),
                    filled($get('document_file'))
                        ? __('core::onboarding.wizard.new_document')
                        : ($this->hasPreviousDocument ? __('core::onboarding.wizard.previous_document') : null),
                ])->filter()->implode(' — ')),
        ];
    }
}
