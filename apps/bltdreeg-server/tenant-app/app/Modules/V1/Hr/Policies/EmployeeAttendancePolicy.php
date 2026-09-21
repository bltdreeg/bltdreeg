<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Policies;

use Bltdreeg\Core\Models\EmployeeAttendance;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class EmployeeAttendancePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('attendance.index');
    }

    public function view(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('attendance.view');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('attendance.create');
    }

    public function update(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('attendance.update');
    }

    public function delete(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('attendance.delete');
    }

    public function checkIn(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('attendance.check-in');
    }

    public function checkOut(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('attendance.check-out');
    }
}
