<?php

namespace App\Modules\V1\Hr\Filament\Resources\Attendance\Pages;

use App\Modules\V1\Hr\Filament\Resources\Attendance\EmployeeAttendanceResource;
use Filament\Resources\Pages\ViewRecord;

class ViewAttendance extends ViewRecord
{
    protected static string $resource = EmployeeAttendanceResource::class;
}
