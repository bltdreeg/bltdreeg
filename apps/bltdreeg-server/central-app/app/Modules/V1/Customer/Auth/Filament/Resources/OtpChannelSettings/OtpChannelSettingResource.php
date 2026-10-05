<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\OtpChannelSettings;

use App\Modules\V1\Customer\Auth\Filament\Resources\OtpChannelSettings\Pages\ListOtpChannelSettings;
use App\Modules\V1\Customer\Auth\Filament\Resources\OtpChannelSettings\Schemas\OtpChannelSettingForm;
use App\Modules\V1\Customer\Auth\Filament\Resources\OtpChannelSettings\Tables\OtpChannelSettingsTable;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OtpChannelSettingResource extends Resource
{
    protected static ?string $model = OtpChannelSetting::class;

    protected static ?int $navigationSort = 21;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedAdjustmentsHorizontal;

    public static function getNavigationGroup(): string
    {
        return 'Customers';
    }

    public static function getNavigationLabel(): string
    {
        return 'OTP Channels';
    }

    public static function getLabel(): string
    {
        return 'OTP Channel Setting';
    }

    public static function getPluralLabel(): string
    {
        return 'OTP Channels';
    }

    public static function form(Schema $schema): Schema
    {
        return OtpChannelSettingForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OtpChannelSettingsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOtpChannelSettings::route('/'),
        ];
    }
}
