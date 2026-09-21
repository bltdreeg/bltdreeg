<?php

namespace App\Modules\V1\Hr\Filament\Resources\Shifts\Pages;

use App\Modules\V1\Hr\Filament\Resources\Shifts\ShiftResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListShifts extends ListRecords
{
    protected static string $resource = ShiftResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label(__('core::attendance.create_shift')),
        ];
    }
}
