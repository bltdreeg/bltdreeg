<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages;

use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\LeaveRequestResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Validation\ValidationException;

class EditLeaveRequest extends EditRecord
{
    protected static string $resource = LeaveRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            LeaveRequestResource::approveAction(),
            LeaveRequestResource::rejectAction(),
            LeaveRequestResource::cancelAction(),
            DeleteAction::make(),
        ];
    }

    /**
     * Editing keeps the same double-booking guard as creating, minus the record
     * being edited so it never blocks itself.
     */
    protected function beforeSave(): void
    {
        $state = $this->form->getRawState();

        if (LeaveRequestResource::hasOverlappingRequest(
            $state['user_id'] ?? null,
            $state['start_date'] ?? null,
            $state['end_date'] ?? null,
            $this->getRecord(),
        )) {
            throw ValidationException::withMessages([
                'data.end_date' => __('core::leave_requests.overlapping_request'),
            ]);
        }
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }
}
