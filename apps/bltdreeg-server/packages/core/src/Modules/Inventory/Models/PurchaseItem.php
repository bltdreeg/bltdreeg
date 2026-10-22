<?php

namespace Bltdreeg\Core\Modules\Inventory\Models;

use Bltdreeg\Core\Modules\Inventory\Database\Factories\PurchaseItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One product line on a purchase.
 *
 * Deliberately has no `tenant_id`: the table is only ever reached through its
 * `purchase`, which is tenant scoped. Never expose this model as a top-level
 * Filament resource or query it unscoped — use `scopeForTenant()` instead.
 */
#[Fillable(['purchase_id', 'product_id', 'quantity', 'unit_cost', 'discount', 'tax', 'total'])]
class PurchaseItem extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return PurchaseItemFactory::new();
    }

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'unit_cost' => 'decimal:2',
            'discount' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Line total, derived the same way Purchase::recalculateTotals() sums them:
     * gross less discount plus tax. Stored in `total`, recomputed on every save
     * by the Filament form's dehydrate hook.
     */
    public function calculateTotal(): float
    {
        $gross = (float) $this->quantity * (float) $this->unit_cost;

        return round($gross - (float) $this->discount + (float) $this->tax, 2);
    }

    public function gross(): float
    {
        return round((float) $this->quantity * (float) $this->unit_cost, 2);
    }
}
