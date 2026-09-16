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
        return $authUser->can('job-types.index');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('job-types.view');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('job-types.create');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('job-types.update');
    }

    public function delete(AuthUser $authUser): bool
    {
        return $authUser->can('job-types.delete');
    }
}
