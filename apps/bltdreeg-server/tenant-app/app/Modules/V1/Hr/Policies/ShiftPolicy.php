<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Policies;

use Bltdreeg\Core\Models\Shift;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class ShiftPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('shifts.index');
    }

    public function view(AuthUser $authUser, Shift $shift): bool
    {
        return $authUser->can('shifts.view');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('shifts.create');
    }

    public function update(AuthUser $authUser, Shift $shift): bool
    {
        return $authUser->can('shifts.update');
    }

    public function delete(AuthUser $authUser, Shift $shift): bool
    {
        return $authUser->can('shifts.delete');
    }
}
