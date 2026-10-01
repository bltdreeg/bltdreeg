<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\OtpDeliveries\Pages;

use App\Modules\V1\Customer\Auth\Filament\Resources\OtpDeliveries\OtpDeliveryResource;
use Filament\Resources\Pages\ListRecords;

class ListOtpDeliveries extends ListRecords
{
    protected static string $resource = OtpDeliveryResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
