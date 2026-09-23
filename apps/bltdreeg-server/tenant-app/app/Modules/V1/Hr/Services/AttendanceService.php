<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Services;

use App\Modules\V1\Hr\Exceptions\AttendanceException;
use Bltdreeg\Core\Modules\Hr\Enums\AttendenceStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Hr\Models\EmployeeAttendance;
use Bltdreeg\Core\Modules\Hr\Models\Shift;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Carbon\CarbonInterface;
use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class AttendanceService
{
    public function checkIn(User $user, CarbonInterface|string|null $now = null, ?Branch $branch = null, ?string $notes = null, ?Tenant $tenant = null): EmployeeAttendance
    {
        $tenant ??= $this->currentTenant();

        $this->assertEmployeeBelongsToTenant($user, $tenant);

        $now = $this->now($now);
        $date = $now->toDateString();
        $branch = $this->resolveBranch($user, $tenant, $branch);
        $shift = $this->shiftFor($user, $tenant);

        $record = EmployeeAttendance::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenant->getKey())
            ->where('user_id', $user->getKey())
            ->where('date', $date)
            ->first();

        if ($record !== null && $record->isCheckedIn()) {
            throw new AttendanceException(__('core::attendance.already_checked_in'));
        }

        $lateMinutes = $shift !== null ? $this->lateMinutes($now, $shift) : 0;

        $data = [
            'tenant_id' => $tenant->getKey(),
            'user_id' => $user->getKey(),
            'branch_id' => $branch->getKey(),
            'shift_id' => $shift?->getKey(),
            'date' => $date,
            'check_in' => $now,
            'late_minutes' => $lateMinutes,
            'status' => $lateMinutes > 0 ? AttendenceStatusEnum::LATE : AttendenceStatusEnum::PRESENT,
        ];

        if (filled($notes)) {
            $data['notes'] = $notes;
        }

        if ($record === null) {
            $record = EmployeeAttendance::query()->create($data);
        } else {
            $record->update($data);
        }

        return $record->refresh();
    }

    public function checkOut(User $user, CarbonInterface|string|null $now = null, ?Tenant $tenant = null): EmployeeAttendance
    {
        $tenant ??= $this->currentTenant();

        $this->assertEmployeeBelongsToTenant($user, $tenant);

        $now = $this->now($now);
        $date = $now->toDateString();

        $record = $this->currentRecordFor($user, $date);

        if ($record === null) {
            throw new AttendanceException(__('core::attendance.no_attendance_today'));
        }

        if (! $record->isCheckedIn()) {
            throw new AttendanceException(__('core::attendance.no_attendance_today'));
        }

        if ($record->isCheckedOut()) {
            throw new AttendanceException(__('core::attendance.already_checked_out'));
        }

        $shift = $record->shift;

        $data = [
            'check_out' => $now,
            'worked_minutes' => $this->workedMinutes($record->check_in, $now, $shift),
        ];

        if ($shift !== null) {
            $data['overtime_minutes'] = $this->overtimeMinutes(
                $data['worked_minutes'],
                $this->expectedWorkMinutes($shift),
            );
        } else {
            $data['overtime_minutes'] = 0;
        }

        $record->update($data);

        return $record->refresh();
    }

    public function recalculate(EmployeeAttendance $record): EmployeeAttendance
    {
        $tenant = Tenant::query()->find($record->tenant_id);

        if ($tenant === null) {
            return $record;
        }

        $shift = $record->shift ?? $this->shiftFor($record->user, $tenant);

        if ($record->isCheckedIn() && in_array($record->status, [AttendenceStatusEnum::PRESENT, AttendenceStatusEnum::LATE], true)) {
            $lateMinutes = 0;

            if ($shift !== null) {
                $lateMinutes = $this->lateMinutes($record->check_in, $shift);
            }

            $record->late_minutes = $lateMinutes;
            $record->status = $lateMinutes > 0 ? AttendenceStatusEnum::LATE : AttendenceStatusEnum::PRESENT;
        }

        if ($record->isCheckedIn() && $record->isCheckedOut()) {
            $workedMinutes = $this->workedMinutes($record->check_in, $record->check_out, $shift);
            $record->worked_minutes = $workedMinutes;

            $record->overtime_minutes = $shift !== null
                ? $this->overtimeMinutes($workedMinutes, $this->expectedWorkMinutes($shift))
                : 0;
        }

        $record->save();

        return $record->refresh();
    }

    /**
     * Peak counts for the dashboard summary cards.
     *
     * @return array{total_employees: int, present: int, absent: int, late: int, on_leave: int, day_off: int}
     */
    public function summaryFor(CarbonInterface|string|null $date = null, ?int $branchId = null, ?Tenant $tenant = null): array
    {
        $tenant ??= $this->currentTenant();
        $date = $this->now($date)->toDateString();

        $totalEmployees = $this->tenantUsersQuery($tenant, $branchId)
            ->where(fn (Builder $query) => $query
                ->whereNull('start_date')
                ->orWhereDate('start_date', '<=', $date))
            ->count('users.id');

        $byStatus = EmployeeAttendance::query()
            ->where('tenant_id', $tenant->getKey())
            ->where('date', $date)
            ->when($branchId !== null, fn (Builder $query) => $query->where('branch_id', $branchId))
            ->pluck('status')
            ->countBy();

        $present = $byStatus->get(AttendenceStatusEnum::PRESENT->value, 0);
        $late = $byStatus->get(AttendenceStatusEnum::LATE->value, 0);
        $onLeave = $byStatus->get(AttendenceStatusEnum::ON_LEAVE->value, 0);
        $dayOff = $byStatus->get(AttendenceStatusEnum::DAY_OFF->value, 0);

        $accountedFor = $present + $late + $onLeave + $dayOff;

        return [
            'total_employees' => $totalEmployees,
            'present' => $present,
            'late' => $late,
            'on_leave' => $onLeave,
            'day_off' => $dayOff,
            'absent' => max(0, $totalEmployees - $accountedFor),
        ];
    }

    public function shiftFor(User $user, Tenant $tenant): ?Shift
    {
        $membership = $user->tenants()->whereKey($tenant->getKey())->first();

        $shiftId = $membership?->pivot?->shift_id;

        return $shiftId === null ? null : Shift::query()->find($shiftId);
    }

    /**
     * @return Builder<User>
     */
    public function tenantUsersQuery(Tenant $tenant, ?int $branchId = null): Builder
    {
        return User::query()
            ->where('is_active', true)
            ->whereHas('tenants', fn (Builder $query) => $query->whereKey($tenant->getKey()))
            ->when($branchId !== null, fn (Builder $query) => $query->where('branch_id', $branchId));
    }

    private function currentRecordFor(User $user, string $date): ?EmployeeAttendance
    {
        return EmployeeAttendance::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $this->currentTenant()->getKey())
            ->where('user_id', $user->getKey())
            ->where('date', $date)
            ->first();
    }

    private function currentTenant(): Tenant
    {
        $tenant = app(TenantContext::class)->tenant
            ?? Filament::getTenant();

        if ($tenant instanceof Tenant) {
            return $tenant;
        }

        throw new AttendanceException('No active tenant context.');
    }

    private function assertEmployeeBelongsToTenant(User $user, Tenant $tenant): void
    {
        if (! $user->is_super_admin && ! $user->belongsToTenant($tenant)) {
            throw new AttendanceException(__('core::attendance.employee_not_in_tenant'));
        }
    }

    private function resolveBranch(User $user, Tenant $tenant, ?Branch $explicit): Branch
    {
        foreach ([$explicit, $user->branch, app(BranchContext::class)->branch] as $candidate) {
            if ($candidate instanceof Branch && $candidate->tenant_id === $tenant->getKey()) {
                return $candidate;
            }
        }

        throw new AttendanceException(__('core::attendance.no_branch'));
    }

    private function now(CarbonInterface|string|null $now): CarbonInterface
    {
        return Carbon::parse($now ?? now());
    }

    private function lateMinutes(CarbonInterface $checkIn, Shift $shift): int
    {
        $start = Carbon::parse($shift->start_time)->setDateFrom($checkIn);

        if (! $checkIn->isAfter($start)) {
            return 0;
        }

        return (int) $start->diffInMinutes($checkIn);
    }

    private function workedMinutes(CarbonInterface $checkIn, CarbonInterface $checkOut, ?Shift $shift): int
    {
        $worked = (int) $checkIn->diffInMinutes($checkOut);

        if ($shift !== null) {
            $worked = max(0, $worked - $shift->break_minutes);
        }

        return $worked;
    }

    private function expectedWorkMinutes(Shift $shift): int
    {
        $start = Carbon::parse($shift->start_time);
        $end = Carbon::parse($shift->end_time);

        if ($end->lessThanOrEqualTo($start)) {
            $end->addDay();
        }

        return max(0, (int) $start->diffInMinutes($end) - $shift->break_minutes);
    }

    private function overtimeMinutes(int $workedMinutes, int $expectedMinutes): int
    {
        return max(0, $workedMinutes - $expectedMinutes);
    }
}
