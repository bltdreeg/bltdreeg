<?php

namespace App\Modules\V1\Auth\Filament\Pages;

use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Onboarding\Support\LegalTerms;
use Bltdreeg\Core\Modules\Onboarding\Support\SalonRegistrationService;
use Filament\Auth\Pages\Register as BaseRegister;
use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\HtmlString;
use SensitiveParameter;

class Register extends BaseRegister
{
    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('salon_name')
                    ->label(__('core::onboarding.register.salon_name'))
                    ->required()
                    ->maxLength(255)
                    ->autofocus(),
                TextInput::make('owner_name')
                    ->label(__('core::onboarding.register.owner_name'))
                    ->required()
                    ->maxLength(255),
                $this->getEmailFormComponent()
                    ->unique(Tenant::class, 'email'),
                TextInput::make('phone')
                    ->label(__('core::onboarding.register.phone'))
                    ->tel()
                    ->required()
                    ->maxLength(30)
                    ->unique(User::class, 'phone'),
                $this->getPasswordFormComponent(),
                $this->getPasswordConfirmationFormComponent(),
                Checkbox::make('accept_terms')
                    ->label(new HtmlString(__('core::onboarding.register.accept_terms', [
                        'terms' => e(LegalTerms::termsUrl()),
                        'privacy' => e(LegalTerms::privacyUrl()),
                    ])))
                    ->accepted()
                    ->validationMessages([
                        'accepted' => __('core::onboarding.register.accept_terms_required'),
                    ])
                    ->dehydrated(false),
            ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRegistration(#[SensitiveParameter] array $data): Model
    {
        return app(SalonRegistrationService::class)->register([
            'salon_name' => $data['salon_name'],
            'owner_name' => $data['owner_name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => $data['password'],
        ]);
    }

    public function getTitle(): string|Htmlable
    {
        return __('core::onboarding.register.title');
    }

    public function getHeading(): string|Htmlable|null
    {
        return __('core::onboarding.register.heading');
    }
}
