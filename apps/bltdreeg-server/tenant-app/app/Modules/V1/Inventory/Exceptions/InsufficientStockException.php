<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Exceptions;

use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;

/**
 * Raised when a movement would drive a branch's stock below zero. Stock is never
 * allowed to go negative — the operation is refused and nothing is written.
 */
class InsufficientStockException extends InventoryException
{
    public function __construct(
        public readonly Product $product,
        public readonly Branch $branch,
        public readonly float $requested,
        public readonly float $available,
    ) {
        parent::__construct(__('core::inventory.insufficient_stock_detail', [
            'product' => $product->name,
            'available' => rtrim(rtrim(number_format($available, 3, '.', ''), '0'), '.'),
            'unit' => $product->unit,
            'branch' => $branch->name,
            'requested' => rtrim(rtrim(number_format($requested, 3, '.', ''), '0'), '.'),
        ]));
    }

    public static function forProduct(
        Product $product,
        Branch $branch,
        float $requested,
        float $available,
    ): self {
        return new self($product, $branch, $requested, $available);
    }
}
