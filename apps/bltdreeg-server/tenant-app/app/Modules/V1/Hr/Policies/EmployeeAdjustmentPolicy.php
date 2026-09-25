<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Policies;

use Bltdreeg\Core\Modules\Hr\Models\EmployeeAdjustment;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class EmployeeAdjustmentPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:EmployeeAdjustment');
    }

    public function view(AuthUser $authUser, EmployeeAdjustment $adjustment): bool
    {
        return $authUser->can('View:EmployeeAdjustment');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:EmployeeAdjustment');
    }

    public function update(AuthUser $authUser, EmployeeAdjustment $adjustment): bool
    {
        return $authUser->can('Update:EmployeeAdjustment');
    }

    public function delete(AuthUser $authUser, EmployeeAdjustment $adjustment): bool
    {
        return $authUser->can('Delete:EmployeeAdjustment');
    }

    public function approve(AuthUser $authUser, EmployeeAdjustment $adjustment): bool
    {
        return $authUser->can('Approve:EmployeeAdjustment');
    }
}
