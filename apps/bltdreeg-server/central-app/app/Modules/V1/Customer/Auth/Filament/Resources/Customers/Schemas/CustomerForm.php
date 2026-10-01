<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CustomerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Profile Information')
                    ->columns(2)
                    ->schema([
                        TextInput::make('ulid')
                            ->label('ULID')
                            ->disabled(),
                        Toggle::make('is_active')
                            ->label('Active Status')
                            ->disabled(),
                        TextInput::make('first_name')
                            ->label('First Name')
                            ->disabled(),
                        TextInput::make('last_name')
                            ->label('Last Name')
                            ->disabled(),
                        TextInput::make('phone')
                            ->label('Phone Number')
                            ->disabled(),
                        TextInput::make('email')
                            ->label('Email Address')
                            ->disabled(),
                        DatePicker::make('birth_date')
                            ->label('Birth Date')
                            ->disabled(),
                        TextInput::make('locale')
                            ->label('Preferred Locale')
                            ->disabled(),
                    ]),

                Section::make('Location & Terms')
                    ->columns(2)
                    ->schema([
                        TextInput::make('last_lat')
                            ->label('Latitude')
                            ->disabled(),
                        TextInput::make('last_lng')
                            ->label('Longitude')
                            ->disabled(),
                        TextInput::make('terms_version')
                            ->label('Terms Version')
                            ->disabled(),
                        TextInput::make('terms_accepted_at')
                            ->label('Terms Accepted At')
                            ->disabled(),
                    ]),
            ]);
    }
}
