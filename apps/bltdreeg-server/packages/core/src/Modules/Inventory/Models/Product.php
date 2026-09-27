<?php

namespace Bltdreeg\Core\Modules\Inventory\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Inventory\Database\Factories\ProductFactory;
use Bltdreeg\Core\Modules\Inventory\Enums\UnitEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id',
    'category_id',
    'name',
    'sku',
    'barcode',
    'description',
    'image',
    'price',
    'sale_price',
    'unit',
    'low_stock_threshold',
    'track_inventory',
    'is_active',
])]
class Product extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return ProductFactory::new();
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'unit' => UnitEnum::class,
            'low_stock_threshold' => 'integer',
            'track_inventory' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    /**
     * The product's inventory row for a single branch, if it has ever been stocked.
     */
    public function inventoryFor(int|string $branchId): ?Inventory
    {
        return $this->inventories()
            ->where('branch_id', $branchId)
            ->first();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeTracked(Builder $query): Builder
    {
        return $query->where('track_inventory', true);
    }

    /**
     * Units on hand across every branch, computed from the loaded rows so the
     * products table does not need a correlated subquery per row.
     */
    public function totalStock(): float
    {
        if ($this->inventories === null) {
            $this->loadMissing('inventories');
        }

        return (float) $this->inventories->sum('quantity');
    }

    public function totalReserved(): float
    {
        if ($this->inventories === null) {
            $this->loadMissing('inventories');
        }

        return (float) $this->inventories->sum('reserved_quantity');
    }

    public function availableStock(): float
    {
        return $this->totalStock() - $this->totalReserved();
    }

    /**
     * A product is on sale when a discount price is set alongside the regular one.
     */
    public function isOnSale(): bool
    {
        return $this->sale_price !== null;
    }

    /**
     * What a sale actually charges: the discount price when the product is on
     * sale, otherwise the regular price. Cost lives on the purchase lines, so
     * there is no product-level margin to report.
     */
    public function currentPrice(): float
    {
        return (float) ($this->sale_price ?? $this->price);
    }

    /**
     * A product that does not track inventory has no meaningful stock level, so it
     * is never low or out of stock — there is nothing to run out of.
     */
    public function isLowStock(): bool
    {
        if (! $this->track_inventory) {
            return false;
        }

        return $this->totalStock() <= (float) $this->low_stock_threshold;
    }

    public function isOutOfStock(): bool
    {
        if (! $this->track_inventory) {
            return false;
        }

        return $this->totalStock() <= 0;
    }
}
