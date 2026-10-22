<?php

namespace Bltdreeg\Core\Modules\Inventory\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Inventory\Database\Factories\InventoryTransactionFactory;
use Bltdreeg\Core\Modules\Inventory\Enums\TransactionTypeEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Append-only audit record of every stock movement. This is the source of truth:
 * `inventories.quantity` is the running total derived from these rows.
 *
 * `quantity` is stored as a signed movement, so for every row
 * `previous balance + quantity === balance_after` holds. Read the direction with
 * {@see TransactionTypeEnum::direction()} rather than the sign alone, since
 * `ADJUSTMENT` is polarity free.
 */
#[Fillable([
    'tenant_id',
    'branch_id',
    'product_id',
    'inventory_id',
    'type',
    'quantity',
    'unit_cost',
    'balance_after',
    'reference_type',
    'reference_id',
    'notes',
])]
class InventoryTransaction extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return InventoryTransactionFactory::new();
    }

    protected function casts(): array
    {
        return [
            'type' => TransactionTypeEnum::class,
            'quantity' => 'decimal:3',
            'unit_cost' => 'decimal:2',
            'balance_after' => 'decimal:3',
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

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    /**
     * What caused the movement — a Purchase, and so on.
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeOfType(Builder $query, TransactionTypeEnum|array $types): Builder
    {
        $values = array_map(
            fn (TransactionTypeEnum|int|string $type): int => $type instanceof TransactionTypeEnum
                ? $type->value
                : (int) $type,
            is_array($types) ? $types : [$types],
        );

        return $query->whereIn('type', $values);
    }

    public function scopeForBranch(Builder $query, int|string $branchId): Builder
    {
        return $query->where('branch_id', $branchId);
    }

    public function isIncrease(): bool
    {
        return (float) $this->quantity > 0;
    }

    public function isDecrease(): bool
    {
        return (float) $this->quantity < 0;
    }

    public function movement(): float
    {
        return (float) $this->quantity;
    }
}
