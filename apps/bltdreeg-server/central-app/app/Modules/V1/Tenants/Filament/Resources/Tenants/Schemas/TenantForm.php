<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Tenants\Schemas;

use Bltdreeg\Core\Enums\CurrencyEnum;
use Bltdreeg\Core\Models\User;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class TenantForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('slug')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                TextInput::make('email')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true),
                TextInput::make('phone')
                    ->tel()
                    ->required()
                    ->maxLength(255),
                FileUpload::make('logo')
                    ->image()
                    ->directory('tenants/logos'),
                Textarea::make('address')
                    ->required(),
                Select::make('currency')
                    ->options(CurrencyEnum::class)
                    ->required(),
                Toggle::make('is_active')
                    ->default(true),
                Section::make('Salon owner')
                    ->description('This person can sign into the tenant app as the salon super admin. They do not get central-app access.')
                    ->schema([
                        TextInput::make('owner_name')
                            ->label('Name')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('owner_email')
                            ->label('Email')
                            ->email()
                            ->required()
                            ->unique(User::class, 'email'),
                        TextInput::make('owner_password')
                            ->label('Password')
                            ->password()
                            ->revealable()
                            ->required()
                            ->minLength(8),
                    ])
                    ->visibleOn('create'),
            ]);
    }
}
