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
        return $authUser->can('ViewAny:Branch');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('View:Branch');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Branch');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('Update:Branch');
    }

    public function delete(AuthUser $authUser): bool
    {
        return $authUser->can('Delete:Branch');
    }
}
