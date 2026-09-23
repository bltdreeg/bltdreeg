<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Tenants\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RolesRelationManager extends RelationManager
{
    protected static string $relationship = 'roles';

    protected static ?string $title = 'Roles';

    public function isReadOnly(): bool
    {
        return true;
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                IconColumn::make('is_system')
                    ->boolean(),
                TextColumn::make('guard_name'),
                TextColumn::make('sourceTemplate.name')
                    ->label('Template')
                    ->placeholder('—'),
            ]);
    }
}
