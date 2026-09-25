<?php

namespace App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages;

use App\Modules\V1\Hr\Filament\Resources\Adjustments\EmployeeAdjustmentResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewAdjustment extends ViewRecord
{
    protected static string $resource = EmployeeAdjustmentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EmployeeAdjustmentResource::approveAction(),
            EditAction::make(),
        ];
    }
}
