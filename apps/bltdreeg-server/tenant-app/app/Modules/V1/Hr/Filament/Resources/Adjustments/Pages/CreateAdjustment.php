<?php

namespace App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages;

use App\Modules\V1\Hr\Filament\Resources\Adjustments\EmployeeAdjustmentResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;

class CreateAdjustment extends CreateRecord
{
    protected static string $resource = EmployeeAdjustmentResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by'] = Auth::id();

        return $data;
    }
}
