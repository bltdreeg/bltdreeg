<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Exceptions;

use RuntimeException;

/**
 * Base class for every inventory rule violation. Filament pages catch this and
 * surface a Notification instead of a 500, so a rejected operation never leaves
 * the user staring at a stack trace.
 */
class InventoryException extends RuntimeException
{
    public static function make(string $message): self
    {
        return new self($message);
    }

    /**
     * A caller handed us a product or branch that is not the current tenant's.
     *
     * Rejecting this matters: the models passed to a service are already loaded,
     * so the tenant global scopes do not re-check them, and a mismatched pair
     * would otherwise create an `inventories` row pairing another tenant's
     * product with our branch.
     */
    public static function crossTenant(string $model): self
    {
        return new self(__('core::inventory.wrong_tenant', ['model' => $model]));
    }

    /**
     * Reserved stock can never exceed what is actually on the shelf, otherwise
     * `availableQuantity()` would report a negative number to sell against.
     */
    public static function reservedExceedsQuantity(float $reserved, float $quantity): self
    {
        return new self(__('core::inventory.reserved_exceeds_quantity', [
            'reserved' => $reserved,
            'quantity' => $quantity,
        ]));
    }

    /**
     * A stock row already exists for this product at this branch. The unique
     * index on (branch_id, product_id) is the real guarantee; this only makes
     * the Filament form fail with a readable message.
     */
    public static function duplicateStockRow(): self
    {
        return new self(__('core::inventory.duplicate_stock_row'));
    }
}
