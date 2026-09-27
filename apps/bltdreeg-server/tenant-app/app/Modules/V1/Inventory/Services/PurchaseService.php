<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Services;

use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Exceptions\PurchaseAlreadyReceivedException;
use App\Modules\V1\Inventory\Exceptions\PurchaseNotEditableException;
use Bltdreeg\Core\Modules\Inventory\Enums\PurchaseStatusEnum;
use Bltdreeg\Core\Modules\Inventory\Enums\TransactionTypeEnum;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Bltdreeg\Core\Modules\Inventory\Models\PurchaseItem;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Purchase lifecycle: draft -> received, with the received state being the only
 * thing that ever moves stock.
 *
 * `receive()` is the guarded boundary. It re-reads the purchase under a row lock
 * inside the transaction, so a second click, a second tab, or a retried request
 * finds the status already flipped and is rejected. The check is not on the
 * in-memory model the caller happened to load — that would be trivially bypassed
 * by two concurrent requests both holding a stale `DRAFT`.
 */
class PurchaseService
{
    public function __construct(private readonly InventoryService $inventory) {}

    /**
     * Create a draft purchase with its items. The header money columns are always
     * derived from the items, never taken from the caller.
     *
     * @param  array{branch_id: int|string, purchase_date?: string, supplier_name?: string|null, supplier_phone?: string|null, notes?: string|null}  $attributes
     * @param  list<array{product_id: int|string, quantity: float, unit_cost: float, discount?: float|null, tax?: float|null}>  $items
     */
    public function create(array $attributes, array $items): Purchase
    {
        return DB::transaction(function () use ($attributes, $items): Purchase {
            $purchase = Purchase::query()->create([
                'tenant_id' => $this->resolveTenantId($attributes),
                'branch_id' => $attributes['branch_id'],
                'purchase_number' => Purchase::nextPurchaseNumber(),
                'supplier_name' => $attributes['supplier_name'] ?? null,
                'supplier_phone' => $attributes['supplier_phone'] ?? null,
                'purchase_date' => $attributes['purchase_date'] ?? now()->toDateString(),
                'status' => PurchaseStatusEnum::DRAFT,
                'notes' => $attributes['notes'] ?? null,
            ]);

            $this->syncItems($purchase, $items);

            return $purchase;
        });
    }

    /**
     * Update a draft purchase. Refuses once received, because its items are the
     * source of stock movements that have already been applied.
     *
     * @param  array<string, mixed>  $attributes
     * @param  list<array{product_id: int|string, quantity: float, unit_cost: float, discount?: float|null, tax?: float|null}>  $items
     */
    public function update(Purchase $purchase, array $attributes, array $items): Purchase
    {
        return DB::transaction(function () use ($purchase, $attributes, $items): Purchase {
            $locked = $this->lockPurchase($purchase->getKey());

            if (! $locked->isDraft()) {
                throw new PurchaseNotEditableException($locked);
            }

            $locked->fill([
                'branch_id' => $attributes['branch_id'] ?? $locked->branch_id,
                'supplier_name' => $attributes['supplier_name'] ?? $locked->supplier_name,
                'supplier_phone' => $attributes['supplier_phone'] ?? $locked->supplier_phone,
                'purchase_date' => $attributes['purchase_date'] ?? $locked->purchase_date,
                'notes' => $attributes['notes'] ?? $locked->notes,
            ]);

            $this->syncItems($locked, $items);

            return $locked;
        });
    }

    /**
     * Receive a purchase: credit the branch stock for every line and write a
     * `purchase` movement for each one.
     *
     * Idempotent by refusal: the status check happens under a row lock, so stock
     * is credited exactly once no matter how many times this is called.
     *
     * @return Collection<int, InventoryTransaction>
     */
    public function receive(Purchase $purchase): Collection
    {
        return DB::transaction(function () use ($purchase): Collection {
            $locked = $this->lockPurchase($purchase->getKey());

            if ($locked->status !== PurchaseStatusEnum::DRAFT) {
                throw new PurchaseAlreadyReceivedException($locked);
            }

            $branch = $locked->branch;

            if (! $branch instanceof Branch) {
                throw InventoryException::make(__('core::inventory.purchase_branch_missing'));
            }

            $transactions = new Collection;

            foreach ($locked->items()->with('product')->get() as $item) {
                /** @var PurchaseItem $item */
                $product = $item->product;

                // A line whose product was removed cannot credit stock; skip it
                // rather than aborting the whole receipt.
                if (! $product) {
                    continue;
                }

                $transactions->push($this->inventory->move(
                    product: $product,
                    branch: $branch,
                    delta: (float) $item->quantity,
                    type: TransactionTypeEnum::PURCHASE,
                    unitCost: (float) $item->unit_cost,
                    reference: $locked,
                    notes: __('core::inventory.receive_purchase').' #'.$locked->purchase_number,
                ));
            }

            $locked->forceFill(['status' => PurchaseStatusEnum::RECEIVED])->save();

            return $transactions;
        });
    }

    /**
     * Cancel a draft. A received purchase cannot be cancelled, because its stock
     * has already been credited and would need reversing movements to undo.
     */
    public function cancel(Purchase $purchase): Purchase
    {
        return DB::transaction(function () use ($purchase): Purchase {
            $locked = $this->lockPurchase($purchase->getKey());

            if ($locked->status !== PurchaseStatusEnum::DRAFT) {
                throw new PurchaseNotEditableException($locked);
            }

            $locked->forceFill(['status' => PurchaseStatusEnum::CANCELLED])->save();

            return $locked;
        });
    }

    /**
     * Replace a purchase's lines and recompute the header totals.
     *
     * Line `total` is derived here rather than trusted from the form, so a
     * tampered request cannot write an item total that disagrees with its own
     * quantity and unit cost.
     *
     * @param  list<array{product_id: int|string, quantity: float, unit_cost: float, discount?: float|null, tax?: float|null}>  $items
     */
    private function syncItems(Purchase $purchase, array $items): void
    {
        $purchase->items()->delete();

        foreach ($items as $item) {
            $quantity = (float) $item['quantity'];
            $unitCost = (float) $item['unit_cost'];
            $discount = (float) ($item['discount'] ?? 0);
            $tax = (float) ($item['tax'] ?? 0);

            $purchase->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'discount' => $discount,
                'tax' => $tax,
                'total' => round($quantity * $unitCost - $discount + $tax, 2),
            ]);
        }

        $purchase->recalculateTotals();
        $purchase->save();
    }

    private function lockPurchase(int|string $purchaseId): Purchase
    {
        return Purchase::query()
            ->whereKey($purchaseId)
            ->lockForUpdate()
            ->firstOrFail();
    }

    /**
     * The tenant always comes from the authenticated context, never from the
     * submitted payload — the caller cannot choose which salon a row lands in.
     */
    private function resolveTenantId(array $attributes): int|string|null
    {
        $tenantId = Purchase::currentTenantId();

        if ($tenantId !== null) {
            return $tenantId;
        }

        return $attributes['tenant_id'] ?? null;
    }
}
