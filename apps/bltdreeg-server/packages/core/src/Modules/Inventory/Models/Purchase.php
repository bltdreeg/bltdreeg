<?php

namespace Bltdreeg\Core\Modules\Inventory\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Inventory\Database\Factories\PurchaseFactory;
use Bltdreeg\Core\Modules\Inventory\Enums\PurchaseStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A supplier order against one branch. `DRAFT -> RECEIVED` is the only forward
 * path: receiving is what credits branch inventory, and it is guarded so it can
 * only ever happen once (see PurchaseService::receive).
 */
#[Fillable([
    'tenant_id',
    'branch_id',
    'purchase_number',
    'supplier_name',
    'supplier_phone',
    'purchase_date',
    'status',
    'subtotal',
    'discount',
    'tax',
    'total',
    'notes',
])]
class Purchase extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return PurchaseFactory::new();
    }

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'status' => PurchaseStatusEnum::class,
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    /**
     * Movement rows this purchase produced when it was received. `reference_type`
     * is matched against both the concrete class and the core base class so the
     * relation resolves whether it is read from a core or an app-level subclass.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'reference_id')
            ->whereIn('reference_type', array_unique([static::class, self::class]));
    }

    public function scopeOfStatus(Builder $query, PurchaseStatusEnum|array $statuses): Builder
    {
        $values = array_map(
            fn (PurchaseStatusEnum|int|string $status): int => $status instanceof PurchaseStatusEnum
                ? $status->value
                : (int) $status,
            is_array($statuses) ? $statuses : [$statuses],
        );

        return $query->whereIn('status', $values);
    }

    public function scopeForBranch(Builder $query, int|string $branchId): Builder
    {
        return $query->where('branch_id', $branchId);
    }

    public function isDraft(): bool
    {
        return $this->status === PurchaseStatusEnum::DRAFT;
    }

    public function isReceived(): bool
    {
        return $this->status === PurchaseStatusEnum::RECEIVED;
    }

    public function isCancelled(): bool
    {
        return $this->status === PurchaseStatusEnum::CANCELLED;
    }

    /**
     * A received purchase has already credited inventory, so its items must not
     * change — editing them would desynchronise the ledger from the stock.
     */
    public function isEditable(): bool
    {
        return $this->isDraft();
    }

    public function itemCount(): int
    {
        return $this->items()->count();
    }

    /**
     * Recompute the money columns from the current item rows. The header totals
     * are always derived, never entered by hand, so the two can never disagree.
     */
    public function recalculateTotals(): void
    {
        $items = $this->relationLoaded('items')
            ? $this->items
            : $this->items()->get();

        $subtotal = 0.0;
        $discount = 0.0;
        $tax = 0.0;
        $total = 0.0;

        foreach ($items as $item) {
            $gross = (float) $item->quantity * (float) $item->unit_cost;
            $lineDiscount = (float) $item->discount;
            $lineTax = (float) $item->tax;

            $subtotal += $gross;
            $discount += $lineDiscount;
            $tax += $lineTax;
            $total += $gross - $lineDiscount + $lineTax;
        }

        $this->forceFill([
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'tax' => round($tax, 2),
            'total' => round($total, 2),
        ]);
    }

    /**
     * Per-tenant sequential number, e.g. `PO-260927-0001`. The unique index on
     * (tenant_id, purchase_number) is the real guard against a race; the retry
     * loop only exists so two concurrent drafts get distinct readable numbers.
     */
    public static function nextPurchaseNumber(?int $tenantId = null): string
    {
        $tenantId ??= static::currentTenantId();
        $base = 'PO-'.now()->format('ymd');

        $latest = static::query()
            ->where('tenant_id', $tenantId)
            ->where('purchase_number', 'like', $base.'-%')
            ->orderByDesc('purchase_number')
            ->value('purchase_number');

        $sequence = is_string($latest)
            ? (int) substr($latest, strlen($base) + 1)
            : 0;

        do {
            $sequence++;
            $candidate = sprintf('%s-%04d', $base, $sequence);
        } while (static::query()
            ->where('tenant_id', $tenantId)
            ->where('purchase_number', $candidate)
            ->exists());

        return $candidate;
    }
}
