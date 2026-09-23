<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Tenants\Tables;

use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TenantsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('slug')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('phone'),
                TextColumn::make('address')
                    ->limit(40),
                TextColumn::make('currency')
                    ->formatStateUsing(fn (CurrencyEnum $state): string => $state->name),
                TextColumn::make('status')
                    ->label(__('core::onboarding.admin.status'))
                    ->badge()
                    ->formatStateUsing(fn (TenantStatusEnum $state): string => $state->label())
                    ->color(fn (TenantStatusEnum $state): string => $state->color()),
                IconColumn::make('is_active')
                    ->boolean(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
