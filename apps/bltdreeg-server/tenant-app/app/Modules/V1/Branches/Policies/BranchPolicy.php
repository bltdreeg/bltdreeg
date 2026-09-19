<?php

declare(strict_types=1);

namespace App\Modules\V1\Branches\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class BranchPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('branches.index');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('branches.view');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('branches.create');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('branches.update');
    }

    public function delete(AuthUser $authUser): bool
    {
        return $authUser->can('branches.delete');
    }
}
