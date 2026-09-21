<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class JobTypePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:JobType');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('View:JobType');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:JobType');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('Update:JobType');
    }

    public function delete(AuthUser $authUser): bool
    {
        return $authUser->can('Delete:JobType');
    }
}
