<?php

namespace Bltdreeg\Core\Modules\Inventory\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Inventory\Database\Factories\InventoryFactory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Stock holding of one product in one branch. The table is unique on
 * (branch_id, product_id), so a product has exactly one row per branch.
 *
 * `quantity` is only ever written by InventoryService, which writes the matching
 * `inventory_transactions` row in the same database transaction. Direct writes
 * bypass the audit trail and desynchronise the ledger.
 */
#[Fillable(['tenant_id', 'branch_id', 'product_id', 'quantity', 'reserved_quantity'])]
class Inventory extends Model
{
    use BelongsToTenant;
    use HasFactory;

    public const STATUS_OUT_OF_STOCK = 'out_of_stock';

    public const STATUS_LOW = 'low';

    public const STATUS_IN_STOCK = 'in_stock';

    protected static function newFactory()
    {
        return InventoryFactory::new();
    }

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'reserved_quantity' => 'decimal:3',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function latestTransaction(): HasOne
    {
        return $this->hasOne(InventoryTransaction::class)->latestOfMany();
    }

    public function scopeForBranch(Builder $query, int|string $branchId): Builder
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereHas(
            'product',
            fn (Builder $query): Builder => $query->whereColumn(
                'products.low_stock_threshold',
                '>=',
                'inventories.quantity',
            ),
        );
    }

    public function availableQuantity(): float
    {
        return (float) $this->quantity - (float) $this->reserved_quantity;
    }

    /**
     * Threshold comes from the product, so read it through the relation rather
     * than assuming the caller eager-loaded it.
     */
    public function lowStockThreshold(): float
    {
        return (float) ($this->product?->low_stock_threshold ?? 0);
    }

    /**
     * An untracked product has no stock level to be short of, so it reads as
     * in-stock rather than alarming the operator about a number nobody maintains.
     */
    public function isOutOfStock(): bool
    {
        if ($this->product?->track_inventory === false) {
            return false;
        }

        return (float) $this->quantity <= 0;
    }

    public function isLowStock(): bool
    {
        if ($this->product?->track_inventory === false) {
            return false;
        }

        return (float) $this->quantity <= $this->lowStockThreshold();
    }

    /**
     * @return self::STATUS_*
     */
    public function status(): string
    {
        if ($this->isOutOfStock()) {
            return self::STATUS_OUT_OF_STOCK;
        }

        if ($this->isLowStock()) {
            return self::STATUS_LOW;
        }

        return self::STATUS_IN_STOCK;
    }
}
