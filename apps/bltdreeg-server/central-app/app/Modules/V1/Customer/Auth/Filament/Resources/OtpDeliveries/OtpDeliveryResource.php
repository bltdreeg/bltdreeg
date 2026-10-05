<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\OtpDeliveries;

use App\Modules\V1\Customer\Auth\Filament\Resources\OtpDeliveries\Pages\ListOtpDeliveries;
use App\Modules\V1\Customer\Auth\Filament\Resources\OtpDeliveries\Tables\OtpDeliveriesTable;
use App\Modules\V1\Customer\Auth\Models\OtpDelivery;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OtpDeliveryResource extends Resource
{
    protected static ?string $model = OtpDelivery::class;

    protected static ?int $navigationSort = 22;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPaperAirplane;

    public static function getNavigationGroup(): string
    {
        return 'Customers';
    }

    public static function getNavigationLabel(): string
    {
        return 'OTP Deliveries';
    }

    public static function getLabel(): string
    {
        return 'OTP Delivery';
    }

    public static function getPluralLabel(): string
    {
        return 'OTP Deliveries';
    }

    public static function table(Table $table): Table
    {
        return OtpDeliveriesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOtpDeliveries::route('/'),
        ];
    }
}
