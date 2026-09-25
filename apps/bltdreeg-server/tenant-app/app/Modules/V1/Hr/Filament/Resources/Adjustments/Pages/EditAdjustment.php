<?php

namespace App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages;

use App\Modules\V1\Hr\Filament\Resources\Adjustments\EmployeeAdjustmentResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAdjustment extends EditRecord
{
    protected static string $resource = EmployeeAdjustmentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EmployeeAdjustmentResource::approveAction(),
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }
}
