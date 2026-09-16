<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Tenants\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ServiceCategoriesRelationManager extends RelationManager
{
    protected static string $relationship = 'serviceCategories';

    protected static ?string $title = 'Categories';

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
                TextColumn::make('description')
                    ->limit(40),
                IconColumn::make('is_active')
                    ->boolean(),
            ]);
    }
}
