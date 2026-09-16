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
        return $authUser->can('categories.index');
    }

    public function view(AuthUser $authUser): bool
    {
        return $authUser->can('categories.view');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('categories.create');
    }

    public function update(AuthUser $authUser): bool
    {
        return $authUser->can('categories.update');
    }

    public function delete(AuthUser $authUser): bool
    {
        return $authUser->can('categories.delete');
    }
}
