<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Policies;

use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

/**
 * Stock levels are never created or deleted by hand — they only ever change
 * through a movement, so this policy grants view plus update (the adjust action)
 * and nothing else.
 */
class InventoryPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Inventory');
    }

    public function view(AuthUser $authUser, Inventory $inventory): bool
    {
        return $authUser->can('View:Inventory');
    }

    public function update(AuthUser $authUser, Inventory $inventory): bool
    {
        return $authUser->can('Update:Inventory');
    }
}
