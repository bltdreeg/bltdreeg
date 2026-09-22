<?php

use App\Modules\V1\Hr\Exceptions\AttendanceException;
use App\Modules\V1\Hr\Services\AttendanceService;
use Bltdreeg\Core\Enums\AttendenceStatusEnum;
use Bltdreeg\Core\Models\Branch;
use Bltdreeg\Core\Models\EmployeeAttendance;
use Bltdreeg\Core\Models\Shift;
use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Bltdreeg\Core\Support\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

function makeEmployee(Tenant $tenant, ?Branch $branch = null, ?Shift $shift = null): User
{
    $user = User::factory()->create(['branch_id' => $branch?->id]);

    $user->tenants()->attach($tenant->id, [
        'shift_id' => $shift?->id,
    ]);

    return $user;
}

function makeShift(Tenant $tenant, string $start = '09:00', string $end = '17:00', int $break = 30): Shift
{
    return Shift::factory()->create([
        'tenant_id' => $tenant->id,
        'start_time' => $start,
        'end_time' => $end,
        'break_minutes' => $break,
    ]);
}

test('an on-time check-in records present status with no late minutes', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $shift = makeShift($tenant);
    $user = makeEmployee($tenant, $branch, $shift);

    app(TenantContext::class)->set($tenant);

    $record = app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(8, 55));

    expect($record->status)->toBe(AttendenceStatusEnum::PRESENT)
        ->and($record->late_minutes)->toBe(0)
        ->and($record->check_in->format('H:i'))->toBe('08:55')
        ->and($record->branch_id)->toBe($branch->id)
        ->and($record->shift_id)->toBe($shift->id)
        ->and($record->date->toDateString())->toBe(Carbon::today()->toDateString());
});

test('a late check-in records late status with the exact late minutes', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $shift = makeShift($tenant, start: '09:00');
    $user = makeEmployee($tenant, $branch, $shift);

    app(TenantContext::class)->set($tenant);

    $record = app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(9, 40));

    expect($record->status)->toBe(AttendenceStatusEnum::LATE)
        ->and($record->late_minutes)->toBe(40);
});

test('an employee without a shift can still check in without late or overtime', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = makeEmployee($tenant, $branch);

    app(TenantContext::class)->set($tenant);

    $record = app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(10, 0));
    $done = app(AttendanceService::class)->checkOut($user, Carbon::createFromTime(14, 0));

    expect($record->status)->toBe(AttendenceStatusEnum::PRESENT)
        ->and($record->late_minutes)->toBe(0)
        ->and($record->shift_id)->toBeNull()
        ->and($done->worked_minutes)->toBe(240)
        ->and($done->overtime_minutes)->toBe(0);
});

test('check-out records worked minutes minus the declared break', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $shift = makeShift($tenant, break: 30);
    $user = makeEmployee($tenant, $branch, $shift);

    app(TenantContext::class)->set($tenant);

    app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(8, 55));
    $record = app(AttendanceService::class)->checkOut($user, Carbon::createFromTime(17, 5));

    expect($record->worked_minutes)->toBe(460)
        ->and($record->overtime_minutes)->toBe(10)
        ->and($record->check_out->format('H:i'))->toBe('17:05');
});

test('a duplicate check-in throws an attendance exception', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = makeEmployee($tenant, $branch);

    app(TenantContext::class)->set($tenant);

    app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(9, 0));

    expect(fn () => app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(9, 30)))
        ->toThrow(AttendanceException::class, __('core::attendance.already_checked_in'));
});

test('check-out without a check-in record throws an attendance exception', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = makeEmployee($tenant, $branch);

    app(TenantContext::class)->set($tenant);

    expect(fn () => app(AttendanceService::class)->checkOut($user))
        ->toThrow(AttendanceException::class, __('core::attendance.no_attendance_today'));
});

test('a double check-out throws an attendance exception', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = makeEmployee($tenant, $branch);

    app(TenantContext::class)->set($tenant);

    app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(9, 0));
    app(AttendanceService::class)->checkOut($user, Carbon::createFromTime(17, 0));

    expect(fn () => app(AttendanceService::class)->checkOut($user))
        ->toThrow(AttendanceException::class, __('core::attendance.already_checked_out'));
});

test('check-in requires the employee to have a branch', function () {
    $tenant = Tenant::factory()->create();
    $user = makeEmployee($tenant);

    app(TenantContext::class)->set($tenant);

    expect(fn () => app(AttendanceService::class)->checkIn($user))
        ->toThrow(AttendanceException::class, __('core::attendance.no_branch'));
});

test('check-in rejects employees who belong to another tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $branchA = Branch::factory()->create(['tenant_id' => $tenantA->id]);

    $user = makeEmployee($tenantA, $branchA);

    app(TenantContext::class)->set($tenantB);

    expect(fn () => app(AttendanceService::class)->checkIn($user))
        ->toThrow(AttendanceException::class, __('core::attendance.employee_not_in_tenant'));
});

test('shift assignment is read from the tenant membership pivot', function () {
    $tenant = Tenant::factory()->create();
    $shift = makeShift($tenant);
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = makeEmployee($tenant, $branch, $shift);

    $resolved = app(AttendanceService::class)->shiftFor($user, $tenant);

    expect($resolved?->getKey())->toBe($shift->id);
});

test('recalculate restores status when check-in time is moved to being on time', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $shift = makeShift($tenant);
    $user = makeEmployee($tenant, $branch, $shift);

    app(TenantContext::class)->set($tenant);

    $record = app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(9, 40));

    expect($record->status)->toBe(AttendenceStatusEnum::LATE);

    $record->check_in = Carbon::createFromTime(8, 58);
    $record->save();

    app(AttendanceService::class)->recalculate($record);

    expect($record->status)->toBe(AttendenceStatusEnum::PRESENT)
        ->and($record->late_minutes)->toBe(0);
});

test('summary counts keep tenants isolated from each other', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $branchA = Branch::factory()->create(['tenant_id' => $tenantA->id]);
    $shiftA = makeShift($tenantA);

    $presentUser = makeEmployee($tenantA, $branchA, $shiftA);
    $lateUser = makeEmployee($tenantA, $branchA, $shiftA);
    $leaveUser = makeEmployee($tenantA, $branchA, $shiftA);
    makeEmployee($tenantB);

    app(TenantContext::class)->set($tenantA);

    app(AttendanceService::class)->checkIn($presentUser, Carbon::createFromTime(9, 0));
    app(AttendanceService::class)->checkIn($lateUser, Carbon::createFromTime(9, 40));

    EmployeeAttendance::query()->create([
        'user_id' => $leaveUser->id,
        'branch_id' => $branchA->id,
        'date' => Carbon::today()->toDateString(),
        'status' => AttendenceStatusEnum::ON_LEAVE,
    ]);

    $summaryA = app(AttendanceService::class)->summaryFor(Carbon::today());

    expect($summaryA['total_employees'])->toBe(3)
        ->and($summaryA['present'])->toBe(1)
        ->and($summaryA['late'])->toBe(1)
        ->and($summaryA['on_leave'])->toBe(1)
        ->and($summaryA['absent'])->toBe(0);

    app(TenantContext::class)->set($tenantB);

    $summaryB = app(AttendanceService::class)->summaryFor(Carbon::today());

    expect($summaryB['total_employees'])->toBe(1)
        ->and($summaryB['present'])->toBe(0)
        ->and($summaryB['absent'])->toBe(1);
});

test('attendance records are scoped to the active tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $branchA = Branch::factory()->create(['tenant_id' => $tenantA->id]);

    $user = makeEmployee($tenantA, $branchA);

    app(TenantContext::class)->set($tenantA);

    app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(9, 0));

    expect(EmployeeAttendance::query()->count())->toBe(1);

    app(TenantContext::class)->set($tenantB);

    expect(EmployeeAttendance::query()->count())->toBe(0);
});

test('the same employee can check in for different tenants on the same day', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $branchA = Branch::factory()->create(['tenant_id' => $tenantA->id]);
    $branchB = Branch::factory()->create(['tenant_id' => $tenantB->id]);

    $user = User::factory()->create(['branch_id' => $branchA->id]);
    $user->tenants()->attach($tenantA->id);
    $user->tenants()->attach($tenantB->id);

    app(TenantContext::class)->set($tenantA);
    $recordA = app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(9, 0));

    $user->forceFill(['branch_id' => $branchB->id])->save();

    app(TenantContext::class)->set($tenantB);
    $recordB = app(AttendanceService::class)->checkIn($user, Carbon::createFromTime(10, 0));

    expect($recordA->tenant_id)->toBe($tenantA->id)
        ->and($recordB->tenant_id)->toBe($tenantB->id)
        ->and($recordA->date->toDateString())->toBe($recordB->date->toDateString())
        ->and(EmployeeAttendance::query()->withoutGlobalScopes()->where('user_id', $user->id)->count())->toBe(2);
});
