<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Policies;

use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

/**
 * The stock ledger is append-only by design — it is the audit trail that
 * `inventories.quantity` is derived from. There is no create, update or delete
 * ability here on purpose, which is why the resource exposes list and view only.
 */
class InventoryTransactionPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:InventoryTransaction');
    }

    public function view(AuthUser $authUser, InventoryTransaction $inventoryTransaction): bool
    {
        return $authUser->can('View:InventoryTransaction');
    }
}
