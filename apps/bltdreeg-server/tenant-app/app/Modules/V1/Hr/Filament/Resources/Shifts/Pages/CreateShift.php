<?php

namespace App\Modules\V1\Hr\Filament\Resources\Shifts\Pages;

use App\Modules\V1\Hr\Filament\Resources\Shifts\ShiftResource;
use Filament\Resources\Pages\CreateRecord;

class CreateShift extends CreateRecord
{
    protected static string $resource = ShiftResource::class;
}
