<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Exceptions;

use Bltdreeg\Core\Modules\Inventory\Models\Purchase;

/**
 * Raised when a purchase is edited after it left the draft state. Its items are
 * the source of the stock movements already applied, so changing them would leave
 * the ledger and the stock level disagreeing.
 */
class PurchaseNotEditableException extends InventoryException
{
    public function __construct(public readonly Purchase $purchase)
    {
        parent::__construct(__('core::inventory.not_editable'));
    }
}
