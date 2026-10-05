<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Tables;

use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class CustomersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('ulid')
                    ->label('ID')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('first_name')
                    ->label('First Name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('last_name')
                    ->label('Last Name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('phone')
                    ->label('Phone')
                    ->formatStateUsing(fn (?string $state): string => $state ? (PhoneNumber::toLocal($state) ?? $state) : '—')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->placeholder('—'),
                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),
                TextColumn::make('created_at')
                    ->label('Joined')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                TernaryFilter::make('is_active')
                    ->label('Active Status'),
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('toggle_active')
                    ->label(fn (Customer $record): string => $record->is_active ? 'Disable' : 'Enable')
                    ->color(fn (Customer $record): string => $record->is_active ? 'danger' : 'success')
                    ->icon(fn (Customer $record): string => $record->is_active ? 'heroicon-o-no-symbol' : 'heroicon-o-check-circle')
                    ->requiresConfirmation()
                    ->modalHeading(fn (Customer $record): string => $record->is_active ? 'Disable Customer Account' : 'Enable Customer Account')
                    ->modalDescription(fn (Customer $record): string => $record->is_active
                        ? 'Disabling this customer will revoke all active sessions immediately.'
                        : 'Enabling this customer will allow them to log in again.')
                    ->action(function (Customer $record): void {
                        if ($record->is_active) {
                            $record->is_active = false;
                            $record->tokens()->delete();
                            $record->save();

                            Notification::make()
                                ->title('Customer account disabled and sessions revoked')
                                ->warning()
                                ->send();
                        } else {
                            $record->is_active = true;
                            $record->save();

                            Notification::make()
                                ->title('Customer account enabled')
                                ->success()
                                ->send();
                        }
                    }),
            ]);
    }
}
