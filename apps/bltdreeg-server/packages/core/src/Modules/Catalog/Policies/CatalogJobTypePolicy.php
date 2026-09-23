<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Catalog\Policies;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class CatalogJobTypePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:CatalogJobType');
    }

    public function view(AuthUser $authUser, CatalogJobType $catalogJobType): bool
    {
        return $authUser->can('View:CatalogJobType');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:CatalogJobType');
    }

    public function update(AuthUser $authUser, CatalogJobType $catalogJobType): bool
    {
        return $authUser->can('Update:CatalogJobType');
    }

    public function delete(AuthUser $authUser, CatalogJobType $catalogJobType): bool
    {
        return $authUser->can('Delete:CatalogJobType');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('DeleteAny:CatalogJobType');
    }

    public function restore(AuthUser $authUser, CatalogJobType $catalogJobType): bool
    {
        return $authUser->can('Restore:CatalogJobType');
    }

    public function forceDelete(AuthUser $authUser, CatalogJobType $catalogJobType): bool
    {
        return $authUser->can('ForceDelete:CatalogJobType');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:CatalogJobType');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:CatalogJobType');
    }

    public function replicate(AuthUser $authUser, CatalogJobType $catalogJobType): bool
    {
        return $authUser->can('Replicate:CatalogJobType');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:CatalogJobType');
    }
}
