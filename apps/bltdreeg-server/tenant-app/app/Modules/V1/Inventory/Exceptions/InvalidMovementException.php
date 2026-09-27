<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Exceptions;

use Bltdreeg\Core\Modules\Inventory\Enums\TransactionTypeEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;

/**
 * A movement was requested that the ledger cannot represent — a zero movement
 * with a directional type, or a sign that contradicts the type.
 */
class InvalidMovementException extends InventoryException
{
    public static function zeroQuantity(TransactionTypeEnum $type): self
    {
        return new self(__('core::inventory.invalid_movement', ['type' => $type->label()]));
    }

    public static function directionMismatch(TransactionTypeEnum $type, float $delta): self
    {
        return new self(__('core::inventory.direction_mismatch', [
            'type' => $type->label(),
            'direction' => $type->increasesStock() ? 'add' : 'remove',
        ]));
    }

    public static function sameBranch(Branch $branch): self
    {
        return new self(__('core::inventory.same_branch_transfer', ['branch' => $branch->name]));
    }

    public static function negativeQuantity(): self
    {
        return new self(__('core::inventory.negative_quantity'));
    }
}
