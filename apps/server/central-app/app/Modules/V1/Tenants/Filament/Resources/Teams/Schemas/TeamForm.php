<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Teams\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class TeamForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('slug')
                    ->required()
                    ->alphaDash()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Select::make('owner_id')
                    ->label('Owner')
                    ->relationship('owner', 'email')
                    ->searchable()
                    ->preload()
                    ->required(),
            ]);
    }
}
