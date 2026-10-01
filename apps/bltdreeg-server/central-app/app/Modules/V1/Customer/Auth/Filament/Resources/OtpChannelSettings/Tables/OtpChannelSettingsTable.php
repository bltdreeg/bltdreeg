<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\OtpChannelSettings\Tables;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use App\Modules\V1\Customer\Auth\Otp\OtpDispatcher;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Throwable;

class OtpChannelSettingsTable
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
                IconColumn::make('is_enabled')
                    ->label('Enabled')
                    ->boolean(),
                TextColumn::make('providers')
                    ->label('Active Providers')
                    ->badge()
                    ->separator(', '),
                TextColumn::make('sort')
                    ->label('Priority')
                    ->sortable(),
            ])
            ->defaultSort('sort')
            ->recordActions([
                EditAction::make(),
                Action::make('send_test')
                    ->label('Send Test Code')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('info')
                    ->form([
                        TextInput::make('recipient')
                            ->label('Test Recipient')
                            ->helperText('Enter Egyptian phone number (e.g. 01012345678) or email')
                            ->required(),
                    ])
                    ->action(function (OtpChannelSetting $record, array $data): void {
                        $recipient = trim((string) $data['recipient']);
                        $channel = OtpChannelEnum::from($record->channel);
                        /** @var OtpDispatcher $dispatcher */
                        $dispatcher = app(OtpDispatcher::class);

                        $message = new OtpMessage(
                            recipient: $recipient,
                            code: '123456',
                            purpose: OtpPurposeEnum::Login,
                            locale: 'ar',
                            channel: $channel,
                        );

                        try {
                            $delivery = $dispatcher->dispatch($message);

                            if ($delivery->status === 'sent') {
                                Notification::make()
                                    ->title("Test code dispatched via {$delivery->provider}")
                                    ->success()
                                    ->send();
                            } else {
                                Notification::make()
                                    ->title("Test delivery failed: {$delivery->error}")
                                    ->danger()
                                    ->send();
                            }
                        } catch (Throwable $e) {
                            Notification::make()
                                ->title('Test code dispatch failed: '.$e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }),
            ]);
    }
}
