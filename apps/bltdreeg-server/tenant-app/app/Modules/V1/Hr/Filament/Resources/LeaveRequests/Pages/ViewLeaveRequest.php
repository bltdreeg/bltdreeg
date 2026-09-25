<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages;

use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\LeaveRequestResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewLeaveRequest extends ViewRecord
{
    protected static string $resource = LeaveRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            LeaveRequestResource::approveAction(),
            LeaveRequestResource::rejectAction(),
            LeaveRequestResource::cancelAction(),
            EditAction::make(),
        ];
    }
}
