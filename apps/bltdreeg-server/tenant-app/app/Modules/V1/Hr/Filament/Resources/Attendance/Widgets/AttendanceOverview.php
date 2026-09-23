<?php

namespace App\Modules\V1\Hr\Filament\Resources\Attendance\Widgets;

use App\Modules\V1\Hr\Services\AttendanceService;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Filament\Facades\Filament;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class AttendanceOverview extends StatsOverviewWidget
{
    protected static bool $isDiscovered = false;

    protected static bool $isLazy = false;

    public ?string $date = null;

    protected function getStats(): array
    {
        $tenant = Filament::getTenant();

        if (! $tenant instanceof Tenant) {
            return [];
        }

        $summary = app(AttendanceService::class)->summaryFor($this->date ?? Carbon::today()->toDateString());

        return [
            Stat::make(__('core::attendance.total_employees'), $summary['total_employees'])
                ->description(__('core::attendance.total_employees_desc'))
                ->color('primary')
                ->icon(Heroicon::OutlinedUserGroup),
            Stat::make(__('core::attendance.present'), $summary['present'])
                ->description(__('core::attendance.present_desc'))
                ->color('success')
                ->icon(Heroicon::OutlinedCheckCircle),
            Stat::make(__('core::attendance.late'), $summary['late'])
                ->description(__('core::attendance.late_desc'))
                ->color('warning')
                ->icon(Heroicon::OutlinedExclamationTriangle),
            Stat::make(__('core::attendance.absent'), $summary['absent'])
                ->description(__('core::attendance.absent_desc'))
                ->color('danger')
                ->icon(Heroicon::OutlinedUserGroup),
            Stat::make(__('core::attendance.on_leave'), $summary['on_leave'])
                ->description(__('core::attendance.on_leave_desc'))
                ->color('info')
                ->icon(Heroicon::OutlinedCalendarDays),
            Stat::make(__('core::attendance.day_off'), $summary['day_off'])
                ->description(__('core::attendance.day_off_desc'))
                ->color('gray')
                ->icon(Heroicon::OutlinedMoon),
        ];
    }
}
