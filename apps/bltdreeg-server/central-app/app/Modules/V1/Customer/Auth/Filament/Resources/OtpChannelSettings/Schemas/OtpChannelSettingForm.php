<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\OtpChannelSettings\Schemas;

use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OtpChannelSettingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Channel Configuration')
                    ->columns(2)
                    ->schema([
                        TextInput::make('channel')
                            ->label('Channel')
                            ->disabled(),
                        Toggle::make('is_enabled')
                            ->label('Enabled')
                            ->required(),
                        TextInput::make('sort')
                            ->label('Sort Priority')
                            ->numeric()
                            ->required(),
                        CheckboxList::make('providers')
                            ->label('Active Providers (in fallback order)')
                            ->options([
                                'log' => 'Local Log (storage/logs/laravel.log)',
                                'fake' => 'Fake (In-Memory Testing)',
                                'mail' => 'Email (Laravel Mail)',
                            ])
                            ->required(),
                    ]),
            ]);
    }
}
