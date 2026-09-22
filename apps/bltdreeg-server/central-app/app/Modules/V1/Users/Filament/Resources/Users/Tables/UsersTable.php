<?php

namespace App\Modules\V1\Users\Filament\Resources\Users\Tables;

use Bltdreeg\Core\Enums\SalaryTypeEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label(__('core::global.name'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('email')
                    ->label(__('core::global.email'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('phone')
                    ->label(__('core::global.phone'))
                    ->searchable(),
                TextColumn::make('start_date')
                    ->label(__('core::users.start_date'))
                    ->date()
                    ->sortable(),
                TextColumn::make('salary_type')
                    ->label(__('core::users.salary_type'))
                    ->formatStateUsing(fn (int $state): string => SalaryTypeEnum::from($state)->label())
                    ->toggleable(),
                TextColumn::make('salary')
                    ->label(__('core::users.salary'))
                    ->formatStateUsing(fn ($state): string => number_format((float) $state, 2))
                    ->toggleable(),
                TextColumn::make('tenants.name')
                    ->label(__('core::tenants.tenant'))
                    ->badge()
                    ->separator(','),
                IconColumn::make('is_super_admin')
                    ->label(__('core::users.central_access'))
                    ->boolean(),
                IconColumn::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->boolean(),
                TextColumn::make('created_at')
                    ->label(__('core::global.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('is_super_admin')
                    ->label(__('core::users.central_access')),
                TernaryFilter::make('is_active')
                    ->label(__('core::global.is_active')),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
