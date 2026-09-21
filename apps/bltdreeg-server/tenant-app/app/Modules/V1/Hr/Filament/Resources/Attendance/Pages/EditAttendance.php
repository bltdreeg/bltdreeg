<?php

namespace App\Modules\V1\Hr\Filament\Resources\Attendance\Pages;

use App\Modules\V1\Hr\Filament\Resources\Attendance\EmployeeAttendanceResource;
use App\Modules\V1\Hr\Services\AttendanceService;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class EditAttendance extends EditRecord
{
    protected static string $resource = EmployeeAttendanceResource::class;

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        [$data['check_in'], $data['check_out']] = $this->combineTimes($data);

        $record->update($data);

        app(AttendanceService::class)->recalculate($record);

        return $record;
    }

    /**
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    private function combineTimes(array $data): array
    {
        $date = $data['date'] ?? null;

        $checkIn = $date !== null && filled($data['check_in'] ?? null)
            ? Carbon::parse($date.' '.$data['check_in'])
            : null;

        $checkOut = $date !== null && filled($data['check_out'] ?? null)
            ? Carbon::parse($date.' '.$data['check_out'])
            : null;

        return [$checkIn, $checkOut];
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
