<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Catalog\Policies;

use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class CatalogServicePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:CatalogService');
    }

    public function view(AuthUser $authUser, CatalogService $catalogService): bool
    {
        return $authUser->can('View:CatalogService');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:CatalogService');
    }

    public function update(AuthUser $authUser, CatalogService $catalogService): bool
    {
        return $authUser->can('Update:CatalogService');
    }

    public function delete(AuthUser $authUser, CatalogService $catalogService): bool
    {
        return $authUser->can('Delete:CatalogService');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('DeleteAny:CatalogService');
    }

    public function restore(AuthUser $authUser, CatalogService $catalogService): bool
    {
        return $authUser->can('Restore:CatalogService');
    }

    public function forceDelete(AuthUser $authUser, CatalogService $catalogService): bool
    {
        return $authUser->can('ForceDelete:CatalogService');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:CatalogService');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:CatalogService');
    }

    public function replicate(AuthUser $authUser, CatalogService $catalogService): bool
    {
        return $authUser->can('Replicate:CatalogService');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:CatalogService');
    }
}
