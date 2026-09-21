<?php

declare(strict_types=1);

namespace App\Modules\V1\Services\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class ServicePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Service');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('View:Service');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Service');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('Update:Service');
    }

    public function delete(AuthUser $authUser): bool
    {
        return $authUser->can('Delete:Service');
    }
}
