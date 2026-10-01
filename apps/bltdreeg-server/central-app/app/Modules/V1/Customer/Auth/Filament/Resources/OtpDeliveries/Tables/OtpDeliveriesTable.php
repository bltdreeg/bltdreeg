<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\OtpDeliveries\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OtpDeliveriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('channel')
                    ->label('Channel')
                    ->badge()
                    ->colors([
                        'success' => 'whatsapp',
                        'info' => 'sms',
                        'warning' => 'email',
                    ]),
                TextColumn::make('provider')
                    ->label('Provider')
                    ->badge(),
                TextColumn::make('recipient_masked')
                    ->label('Recipient')
                    ->searchable(),
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'sent' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('provider_message_id')
                    ->label('Message ID')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('error')
                    ->label('Error')
                    ->limit(40)
                    ->placeholder('—'),
                TextColumn::make('created_at')
                    ->label('Sent At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('channel')
                    ->options([
                        'whatsapp' => 'WhatsApp',
                        'sms' => 'SMS',
                        'email' => 'Email',
                    ]),
                SelectFilter::make('status')
                    ->options([
                        'sent' => 'Sent',
                        'failed' => 'Failed',
                    ]),
            ]);
    }
}
