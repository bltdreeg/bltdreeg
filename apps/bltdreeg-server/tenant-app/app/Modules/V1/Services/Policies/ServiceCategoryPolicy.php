<?php

declare(strict_types=1);

namespace App\Modules\V1\Services\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class ServiceCategoryPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:ServiceCategory');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('View:ServiceCategory');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:ServiceCategory');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('Update:ServiceCategory');
    }

    public function delete(AuthUser $authUser): bool
    {
        return $authUser->can('Delete:ServiceCategory');
    }
}
