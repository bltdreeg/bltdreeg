<?php

namespace App\Modules\V1\Onboarding\Filament\Pages;

use App\Modules\V1\Branches\Support\BranchImages;
use App\Modules\V1\Onboarding\Services\OnboardingService;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Geo\Data\ResolvedLocation;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Bltdreeg\Core\Modules\Geo\Support\GoogleMapsLinkResolver;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Bltdreeg\Core\Modules\Onboarding\Enums\LegalDocumentTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\ServiceLocationTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use DomainException;
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
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Text;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Components\View;
use Filament\Schemas\Components\Wizard;
use Filament\Schemas\Components\Wizard\Step;
use Filament\Schemas\Schema;
use Filament\Support\Enums\Width;
use Filament\Support\Exceptions\Halt;
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

    public ?string $appliedMapsUrl = null;

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
            ->only(['business_name', 'website', 'social_facebook', 'social_instagram', 'social_tiktok', 'social_youtube', 'social_snapchat', 'team_size', 'service_location_type', 'address', 'latitude', 'longitude', 'governorate_id', 'city_id', 'location_source', 'document_type'])
            ->all());

        $this->fillBranchImages($tenant);

        // أول مرة: نعبّي الموقع من الـ IP (أو القاهرة الافتراضية) والمالك يأكّده أو يغيّره
        if (blank($this->data['city_id'] ?? null)) {
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
                    Step::make('address')
                        ->key('address')
                        ->label(__('core::onboarding.wizard.location_step'))
                        // لو المالك حط لينك خرائط جوجل، بنقرأ الموقع منه قبل ما نكمّل؛ لو فشل بنوقف ونعرض الخطأ
                        ->afterValidation(function (): void {
                            if (! $this->applyMapsUrl()) {
                                throw new Halt;
                            }

                            $this->saveDraft();
                        })
                        ->schema([
                            Text::make(__('core::onboarding.wizard.location_intro')),
                            Text::make(__('core::onboarding.wizard.approximate_location'))
                                ->visible(fn (Get $get): bool => in_array($get('location_source'), ['ip', 'default'], true)),
                            View::make('filament.onboarding.location-map'),
                            TextInput::make('maps_url')
                                ->label(__('core::onboarding.wizard.maps_url'))
                                ->placeholder(__('core::onboarding.wizard.maps_url_placeholder'))
                                ->dehydrated(false),
                            Grid::make(2)->schema([
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
                                    ->required()
                                    ->live()
                                    ->afterStateUpdated(function (?string $state): void {
                                        if (filled($state)) {
                                            $this->cityChosen($state);
                                        }
                                    }),
                            ]),
                            Hidden::make('latitude')->required(),
                            Hidden::make('longitude')->required(),
                            Hidden::make('location_source')->required(),
                        ]),
                    Step::make('business')
                        ->key('business')
                        ->label(__('core::onboarding.wizard.steps.business'))
                        ->afterValidation(fn () => $this->saveDraft())
                        ->schema([
                            TextInput::make('business_name')
                                ->label(__('core::onboarding.wizard.business_name'))
                                ->required()
                                ->maxLength(255),
                            TextInput::make('website')
                                ->label(__('core::onboarding.wizard.website'))
                                ->url()
                                ->maxLength(255),
                            Section::make(__('core::onboarding.wizard.social.title'))
                                ->description(__('core::onboarding.wizard.social.description'))
                                ->schema(array_map(
                                    fn (string $platform): TextInput => TextInput::make('social_'.$platform)
                                        ->label(__('core::onboarding.wizard.social.'.$platform))
                                        ->placeholder(__('core::onboarding.wizard.social.'.$platform.'_placeholder'))
                                        ->url()
                                        ->maxLength(255),
                                    OnboardingService::SOCIAL_PLATFORMS,
                                )),
                        ]),
                    Step::make('team')
                        ->key('team')
                        ->label(__('core::onboarding.wizard.steps.team'))
                        ->afterValidation(fn () => $this->saveDraft())
                        ->schema([
                            Radio::make('team_size')
                                ->label(__('core::onboarding.wizard.team_size'))
                                ->options(TeamSizeEnum::options())
                                ->in(array_keys(TeamSizeEnum::options()))
                                ->required(),
                        ]),
                    Step::make('location_type')
                        ->key('location_type')
                        ->label(__('core::onboarding.wizard.steps.location_type'))
                        ->afterValidation(fn () => $this->saveDraft())
                        ->schema([
                            CheckboxList::make('service_location_type')
                                ->label(__('core::onboarding.wizard.service_location_type'))
                                ->options(ServiceLocationTypeEnum::options())
                                ->in(array_keys(ServiceLocationTypeEnum::options()))
                                ->required()
                                ->bulkToggleable(false),
                            Textarea::make('address')
                                ->label(__('core::onboarding.wizard.address'))
                                ->rows(2)
                                ->maxLength(500)
                                ->required(fn (Get $get): bool => $this->requiresAddress($get))
                                // الإظهار على المتصفح مباشرة من غير request للسيرفر؛ الـ required فوق بيتقيّم وقت التحقق بس
                                ->visibleJs("\$get('service_location_type')?.includes('physical')"),
                        ]),
                    Step::make('photos')
                        ->key('photos')
                        ->label(__('core::onboarding.wizard.steps.photos'))
                        ->schema(BranchImages::fields()),
                    Step::make('document')
                        ->key('document')
                        ->label(__('core::onboarding.wizard.steps.document'))
                        ->afterValidation(fn () => $this->saveDraft())
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
                        ->key('review')
                        ->label(__('core::onboarding.wizard.steps.review'))
                        ->schema([
                            Text::make(__('core::onboarding.wizard.review_intro')),
                            ...$this->reviewEntries(),
                        ]),
                ])
                    // الخطوة الحالية في الـ URL (?step=...) عشان الـ refresh يرجّع لنفس الخطوة
                    ->persistStepInQueryString('step')
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

    /**
     * Photos are stored on the branch, not in the draft, so a resubmission starts from what the branch has.
     */
    protected function fillBranchImages(Tenant $tenant): void
    {
        $branch = Branch::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenant->getKey())
            ->orderBy('id')
            ->first();

        $images = array_values($branch?->images ?? []);

        if ($images === []) {
            return;
        }

        $cover = array_search($branch->cover_image, $images, true);

        $this->form->fill([
            ...$this->data,
            'images' => $images,
            'cover_index' => $cover === false ? 0 : $cover,
        ]);
    }

    protected function saveDraft(): void
    {
        app(OnboardingService::class)->saveDraft($this->tenant(), $this->data);
    }

    /**
     * @return bool false when a link was given but its location could not be read
     */
    public function applyMapsUrl(): bool
    {
        $this->resetErrorBag('data.maps_url');

        $url = trim((string) ($this->data['maps_url'] ?? ''));

        // فاضي، أو اتطبّق قبل كده (المالك ممكن يكون عدّل المحافظة/المدينة بعدها): منغيّرش اختياره
        if ($url === '' || $url === $this->appliedMapsUrl) {
            return true;
        }

        $coordinates = app(GoogleMapsLinkResolver::class)->resolve($url);

        if ($coordinates === null) {
            $this->addError('data.maps_url', __('core::onboarding.wizard.maps_url_invalid'));

            return false;
        }

        $this->applyResolved(app(LocationResolver::class)->nearest($coordinates->lat, $coordinates->lng, LocationSourceEnum::MapsUrl));
        $this->appliedMapsUrl = $url;

        return true;
    }

    public function cityChosen(string $cityId): void
    {
        $lat = is_numeric($this->data['latitude'] ?? null) ? (float) $this->data['latitude'] : null;
        $lng = is_numeric($this->data['longitude'] ?? null) ? (float) $this->data['longitude'] : null;
        $source = LocationSourceEnum::tryFromLabel($this->data['location_source'] ?? null) ?? LocationSourceEnum::Manual;

        $this->applyResolved(app(LocationResolver::class)->forCity($cityId, $lat, $lng, $source));
    }

    protected function applyResolved(ResolvedLocation $location): void
    {
        $this->data['governorate_id'] = $location->governorateId();
        $this->data['city_id'] = $location->cityId();
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
            ...array_map(
                fn (string $platform): TextEntry => TextEntry::make('review_social_'.$platform)
                    ->label(__('core::onboarding.wizard.social.'.$platform))
                    ->state(fn (Get $get): ?string => $get('social_'.$platform))
                    ->visible(fn (Get $get): bool => filled($get('social_'.$platform))),
                OnboardingService::SOCIAL_PLATFORMS,
            ),
            TextEntry::make('review_team_size')
                ->label(__('core::onboarding.wizard.steps.team'))
                ->state(fn (Get $get): ?string => TeamSizeEnum::tryFrom((string) $get('team_size'))?->label()),
            TextEntry::make('review_service_location_type')
                ->label(__('core::onboarding.wizard.steps.location_type'))
                ->state(fn (Get $get): ?string => ServiceLocationTypeEnum::labels($get('service_location_type')) ?: null),
            TextEntry::make('review_location')
                ->label(__('core::geo.location'))
                ->state(fn (Get $get): ?string => collect([
                    GeoCity::query()->find($get('city_id'))?->getTranslation('name', app()->getLocale()),
                    GeoGovernorate::query()->find($get('governorate_id'))?->getTranslation('name', app()->getLocale()),
                ])->filter()->implode('، ') ?: null),
            TextEntry::make('review_address')
                ->label(__('core::onboarding.wizard.address'))
                ->state(fn (Get $get): ?string => $get('address'))
                ->visible(fn (Get $get): bool => $this->requiresAddress($get)),
            TextEntry::make('review_photos')
                ->label(__('core::onboarding.wizard.steps.photos'))
                ->state(fn (Get $get): ?string => filled($get('images')) ? (string) count((array) $get('images')) : null)
                ->visible(fn (Get $get): bool => filled($get('images'))),
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
