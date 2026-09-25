<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages;

use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\LeaveRequestResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLeaveRequests extends ListRecords
{
    protected static string $resource = LeaveRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label(__('core::leave_requests.create_leave_request')),
        ];
    }
}
