<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Policies;

use Bltdreeg\Core\Modules\Hr\Models\EmployeeAttendance;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class EmployeeAttendancePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:EmployeeAttendance');
    }

    public function view(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('View:EmployeeAttendance');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:EmployeeAttendance');
    }

    public function update(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('Update:EmployeeAttendance');
    }

    public function delete(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('Delete:EmployeeAttendance');
    }

    public function checkIn(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('CheckIn:EmployeeAttendance');
    }

    public function checkOut(AuthUser $authUser, EmployeeAttendance $attendance): bool
    {
        return $authUser->can('CheckOut:EmployeeAttendance');
    }
}
