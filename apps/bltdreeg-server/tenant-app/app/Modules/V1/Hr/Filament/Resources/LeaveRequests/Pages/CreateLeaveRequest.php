<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages;

use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\LeaveRequestResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CreateLeaveRequest extends CreateRecord
{
    protected static string $resource = LeaveRequestResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by'] = Auth::id();

        return $data;
    }

    protected function beforeCreate(): void
    {
        $state = $this->form->getRawState();

        if (LeaveRequestResource::hasOverlappingRequest(
            $state['user_id'] ?? null,
            $state['start_date'] ?? null,
            $state['end_date'] ?? null,
        )) {
            throw ValidationException::withMessages([
                'data.end_date' => __('core::leave_requests.overlapping_request'),
            ]);
        }
    }
}
