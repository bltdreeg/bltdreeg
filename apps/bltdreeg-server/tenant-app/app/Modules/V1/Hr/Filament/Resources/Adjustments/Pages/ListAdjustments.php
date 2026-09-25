<?php

namespace App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages;

use App\Modules\V1\Hr\Filament\Resources\Adjustments\EmployeeAdjustmentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAdjustments extends ListRecords
{
    protected static string $resource = EmployeeAdjustmentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label(__('core::adjustments.create_adjustment')),
        ];
    }
}
