<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Exceptions;

use Bltdreeg\Core\Modules\Inventory\Models\Purchase;

/**
 * Raised when a purchase is received a second time. Receiving credits stock, so
 * allowing it twice would double the quantity — the guard is the whole point.
 */
class PurchaseAlreadyReceivedException extends InventoryException
{
    public function __construct(public readonly Purchase $purchase)
    {
        parent::__construct(__('core::inventory.already_received'));
    }
}
