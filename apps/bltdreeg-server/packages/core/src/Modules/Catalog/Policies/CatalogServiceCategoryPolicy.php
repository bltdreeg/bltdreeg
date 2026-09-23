<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Catalog\Policies;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class CatalogServiceCategoryPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:CatalogServiceCategory');
    }

    public function view(AuthUser $authUser, CatalogServiceCategory $catalogServiceCategory): bool
    {
        return $authUser->can('View:CatalogServiceCategory');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:CatalogServiceCategory');
    }

    public function update(AuthUser $authUser, CatalogServiceCategory $catalogServiceCategory): bool
    {
        return $authUser->can('Update:CatalogServiceCategory');
    }

    public function delete(AuthUser $authUser, CatalogServiceCategory $catalogServiceCategory): bool
    {
        return $authUser->can('Delete:CatalogServiceCategory');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('DeleteAny:CatalogServiceCategory');
    }

    public function restore(AuthUser $authUser, CatalogServiceCategory $catalogServiceCategory): bool
    {
        return $authUser->can('Restore:CatalogServiceCategory');
    }

    public function forceDelete(AuthUser $authUser, CatalogServiceCategory $catalogServiceCategory): bool
    {
        return $authUser->can('ForceDelete:CatalogServiceCategory');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:CatalogServiceCategory');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:CatalogServiceCategory');
    }

    public function replicate(AuthUser $authUser, CatalogServiceCategory $catalogServiceCategory): bool
    {
        return $authUser->can('Replicate:CatalogServiceCategory');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:CatalogServiceCategory');
    }
}
