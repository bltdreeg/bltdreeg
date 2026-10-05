<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\OtpChannelSettings\Pages;

use App\Modules\V1\Customer\Auth\Filament\Resources\OtpChannelSettings\OtpChannelSettingResource;
use Filament\Resources\Pages\ListRecords;

class ListOtpChannelSettings extends ListRecords
{
    protected static string $resource = OtpChannelSettingResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
