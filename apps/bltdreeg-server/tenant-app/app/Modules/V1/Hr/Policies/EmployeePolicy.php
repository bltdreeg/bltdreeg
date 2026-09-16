<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Policies;

use Bltdreeg\Core\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class EmployeePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('employees.index');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('employees.view');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('employees.create');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('employees.update');
    }

    public function delete(AuthUser $authUser, User $employee): bool
    {
        return $authUser->can('employees.delete') && ! $employee->is_super_admin;
    }
}
