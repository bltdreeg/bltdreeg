<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Policies;

use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class PurchasePolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Purchase');
    }

    public function view(AuthUser $authUser, Purchase $purchase): bool
    {
        return $authUser->can('View:Purchase');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Purchase');
    }

    public function update(AuthUser $authUser, Purchase $purchase): bool
    {
        return $authUser->can('Update:Purchase');
    }

    public function delete(AuthUser $authUser, Purchase $purchase): bool
    {
        return $authUser->can('Delete:Purchase');
    }

    /**
     * Crediting stock is its own permission: it is the one action on a purchase
     * that changes inventory, so it is gated separately from ordinary editing.
     */
    public function receive(AuthUser $authUser, Purchase $purchase): bool
    {
        return $authUser->can('Receive:Purchase');
    }
}
