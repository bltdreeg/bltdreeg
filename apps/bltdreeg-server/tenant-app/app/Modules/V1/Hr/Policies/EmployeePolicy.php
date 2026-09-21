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
        return $authUser->can('ViewAny:User');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('View:User');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:User');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('Update:User');
    }

    public function delete(AuthUser $authUser, User $employee): bool
    {
        return $authUser->can('Delete:User') && ! $employee->is_super_admin;
    }
}
