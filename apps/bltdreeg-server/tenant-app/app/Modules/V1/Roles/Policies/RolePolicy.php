<?php

declare(strict_types=1);

namespace App\Modules\V1\Roles\Policies;

use App\Modules\V1\Roles\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class RolePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('roles.index');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('roles.view');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('roles.create');
    }

    public function update(AuthUser $authUser, Role $role): bool
    {
        return ! $role->is_system && $authUser->can('roles.update');
    }

    public function delete(AuthUser $authUser, Role $role): bool
    {
        return ! $role->is_system && $authUser->can('roles.delete');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('roles.bulk-delete');
    }

    public function replicate(AuthUser $authUser): bool
    {
        return $authUser->can('roles.bulk-duplicate');
    }
}
