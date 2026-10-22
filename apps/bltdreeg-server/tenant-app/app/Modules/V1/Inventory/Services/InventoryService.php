<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Services;

use App\Modules\V1\Inventory\Exceptions\InsufficientStockException;
use App\Modules\V1\Inventory\Exceptions\InvalidMovementException;
use App\Modules\V1\Inventory\Exceptions\InventoryException;
use Bltdreeg\Core\Modules\Inventory\Enums\TransactionTypeEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * The only writer of `inventories.quantity` and `inventory_transactions`.
 *
 * Every mutation runs inside a database transaction, takes a row lock on the
 * inventory row, and writes the movement and the new balance together, so the
 * ledger and the running total cannot drift apart — not under a double-click,
 * and not under two receptionists selling the last unit at the same moment.
 *
 * Callers pass a signed `delta`. Direction is also carried by the transaction
 * type and the two are cross-checked, so a `SALE` with a positive delta is
 * rejected rather than quietly producing a ledger that reads backwards.
 */
class InventoryService
{
    /**
     * Move stock for a product in a branch and record the matching ledger row.
     *
     * @param  float  $delta  Signed movement. Positive adds stock, negative removes it.
     * @param  float|null  $unitCost  Cost basis, recorded when the movement implies one.
     * @param  Model|null  $reference  What caused the movement (a Purchase).
     * @param  bool  $preventNegative  Refuse the movement rather than allowing stock below zero.
     */
    public function move(
        Product $product,
        Branch $branch,
        float $delta,
        TransactionTypeEnum $type,
        ?float $unitCost = null,
        ?Model $reference = null,
        ?string $notes = null,
        bool $preventNegative = true,
    ): InventoryTransaction {
        // A zero movement is meaningless for every type, including the
        // polarity-free ones: it would write a ledger row that changes nothing.
        if ($delta === 0.0) {
            throw InvalidMovementException::zeroQuantity($type);
        }

        $this->assertSameTenant($product, $branch);
        $this->assertDirectionMatchesType($delta, $type);

        return DB::transaction(function () use ($product, $branch, $delta, $type, $unitCost, $reference, $notes, $preventNegative): InventoryTransaction {
            $inventory = $this->lockInventory($product, $branch);

            $current = (float) $inventory->quantity;
            $reserved = (float) $inventory->reserved_quantity;
            $next = round($current + $delta, 3);

            // Reserved units are spoken for, so the floor is the reserved amount
            // rather than zero — this is the same figure `availableQuantity()`
            // advertises, so what the operator sees is what the guard enforces.
            if ($preventNegative && $next < $reserved) {
                throw InsufficientStockException::forProduct(
                    product: $product,
                    branch: $branch,
                    requested: abs($delta),
                    available: max($current - $reserved, 0.0),
                );
            }

            $inventory->forceFill(['quantity' => $next])->save();

            return $this->record(
                inventory: $inventory,
                type: $type,
                delta: $delta,
                balanceAfter: $next,
                unitCost: $unitCost,
                reference: $reference,
                notes: $notes,
            );
        });
    }

    /**
     * Add stock — purchase received, transfer in, or a manual correction.
     */
    public function increase(
        Product $product,
        Branch $branch,
        float $quantity,
        TransactionTypeEnum $type = TransactionTypeEnum::PURCHASE,
        ?float $unitCost = null,
        ?Model $reference = null,
        ?string $notes = null,
    ): InventoryTransaction {
        return $this->move(
            product: $product,
            branch: $branch,
            delta: abs($quantity),
            type: $type,
            unitCost: $unitCost,
            reference: $reference,
            notes: $notes,
        );
    }

    /**
     * Remove stock — damaged, expired, transfer out. Never goes below zero.
     */
    public function decrease(
        Product $product,
        Branch $branch,
        float $quantity,
        TransactionTypeEnum $type = TransactionTypeEnum::SALE,
        ?float $unitCost = null,
        ?Model $reference = null,
        ?string $notes = null,
        bool $preventNegative = true,
    ): InventoryTransaction {
        return $this->move(
            product: $product,
            branch: $branch,
            delta: -abs($quantity),
            type: $type,
            unitCost: $unitCost,
            reference: $reference,
            notes: $notes,
            preventNegative: $preventNegative,
        );
    }

    /**
     * Set stock to an absolute number, recording the difference as an adjustment.
     *
     * This is how a stock take is expressed: the operator states what is actually
     * on the shelf and the ledger explains the gap.
     */
    public function adjustTo(
        Inventory $inventory,
        float $newQuantity,
        ?string $notes = null,
        ?Model $reference = null,
    ): InventoryTransaction {
        if ($newQuantity < 0) {
            throw InvalidMovementException::negativeQuantity();
        }

        return DB::transaction(function () use ($inventory, $newQuantity, $notes, $reference): InventoryTransaction {
            $locked = $this->lockInventoryRow($inventory->getKey());

            $delta = round($newQuantity - (float) $locked->quantity, 3);

            $locked->forceFill(['quantity' => round($newQuantity, 3)])->save();

            return $this->record(
                inventory: $locked,
                type: TransactionTypeEnum::ADJUSTMENT,
                delta: $delta,
                balanceAfter: (float) $locked->quantity,
                unitCost: null,
                reference: $reference,
                notes: $notes,
            );
        });
    }

    /**
     * Open a stock row for a product at a branch.
     *
     * The row is always created empty and any opening quantity is then applied as
     * an adjustment. Writing the figure straight into `quantity` would leave a
     * balance the ledger cannot explain, because `balance_after` is only ever
     * written by a movement.
     */
    public function open(
        Product $product,
        Branch $branch,
        float $openingQuantity = 0.0,
        float $reservedQuantity = 0.0,
        ?string $notes = null,
    ): Inventory {
        $this->assertSameTenant($product, $branch);

        if ($openingQuantity < 0.0) {
            throw InvalidMovementException::negativeQuantity();
        }

        return DB::transaction(function () use ($product, $branch, $openingQuantity, $reservedQuantity, $notes): Inventory {
            $inventory = $this->lockInventory($product, $branch);

            // The opening balance has to land before the reservation: the
            // reservation is validated against what is on the shelf, and the row
            // is still empty at this point.
            if ($openingQuantity > 0.0) {
                $this->adjustTo($inventory, $openingQuantity, $notes);
            }

            $this->setReserved($inventory, $reservedQuantity);

            return $inventory->refresh();
        });
    }

    /**
     * Change how much of a row is spoken for. A reservation is not a movement, so
     * it writes no ledger row; it only narrows what may be sold.
     */
    public function setReserved(Inventory $inventory, float $reservedQuantity): Inventory
    {
        if ($reservedQuantity < 0.0) {
            throw InvalidMovementException::negativeQuantity();
        }

        return DB::transaction(function () use ($inventory, $reservedQuantity): Inventory {
            $locked = $this->lockInventoryRow($inventory->getKey());
            $quantity = (float) $locked->quantity;

            if ($reservedQuantity > $quantity) {
                throw InventoryException::reservedExceedsQuantity($reservedQuantity, $quantity);
            }

            $locked->forceFill(['reserved_quantity' => round($reservedQuantity, 3)])->save();

            return $locked;
        });
    }

    /**
     * Move stock from one branch to another as a matched pair of movements, so
     * both branch ledgers stay complete and the pair cannot half-apply.
     */
    public function transfer(
        Product $product,
        Branch $from,
        Branch $to,
        float $quantity,
        ?string $notes = null,
    ): void {
        if ((string) $from->getKey() === (string) $to->getKey()) {
            throw InvalidMovementException::sameBranch($from);
        }

        DB::transaction(function () use ($product, $from, $to, $quantity, $notes): void {
            $this->decrease(
                product: $product,
                branch: $from,
                quantity: $quantity,
                type: TransactionTypeEnum::TRANSFER_OUT,
                notes: $notes,
            );

            $this->increase(
                product: $product,
                branch: $to,
                quantity: $quantity,
                type: TransactionTypeEnum::TRANSFER_IN,
                notes: $notes,
            );
        });
    }

    /**
     * Current stock for a product in a branch, without creating a row.
     */
    public function quantityFor(Product $product, Branch $branch): float
    {
        return (float) ($product->inventoryFor($branch->getKey())?->quantity ?? 0);
    }

    /**
     * Get the branch's inventory row for a product, creating it on first use, and
     * hold a row lock for the rest of the transaction.
     *
     * `firstOrCreate` alone is not enough: two concurrent first-time sales for the
     * same product/branch pair would both miss, and the unique index on
     * (branch_id, product_id) would turn the loser into a 500. Catching that
     * violation and re-reading turns the race into an ordinary lock wait.
     */
    private function lockInventory(Product $product, Branch $branch): Inventory
    {
        $existing = Inventory::query()
            ->where('branch_id', $branch->getKey())
            ->where('product_id', $product->getKey())
            ->lockForUpdate()
            ->first();

        if ($existing instanceof Inventory) {
            return $existing;
        }

        try {
            return Inventory::query()->create([
                'tenant_id' => $product->tenant_id,
                'branch_id' => $branch->getKey(),
                'product_id' => $product->getKey(),
                'quantity' => 0,
                'reserved_quantity' => 0,
            ]);
        } catch (QueryException $exception) {
            if (! $this->isUniqueViolation($exception)) {
                throw $exception;
            }

            $contender = Inventory::query()
                ->where('branch_id', $branch->getKey())
                ->where('product_id', $product->getKey())
                ->lockForUpdate()
                ->first();

            if (! $contender instanceof Inventory) {
                throw $exception;
            }

            return $contender;
        }
    }

    private function lockInventoryRow(int|string $inventoryId): Inventory
    {
        $inventory = Inventory::query()
            ->whereKey($inventoryId)
            ->lockForUpdate()
            ->first();

        if (! $inventory instanceof Inventory) {
            throw InvalidMovementException::negativeQuantity();
        }

        return $inventory;
    }

    /**
     * Write the ledger row. The balance is passed in rather than recomputed, so
     * it is exactly the value that was persisted to `inventories`.
     */
    private function record(
        Inventory $inventory,
        TransactionTypeEnum $type,
        float $delta,
        float $balanceAfter,
        ?float $unitCost,
        ?Model $reference,
        ?string $notes,
    ): InventoryTransaction {
        return InventoryTransaction::query()->create([
            'tenant_id' => $inventory->tenant_id,
            'branch_id' => $inventory->branch_id,
            'product_id' => $inventory->product_id,
            'inventory_id' => $inventory->getKey(),
            'type' => $type,
            'quantity' => round($delta, 3),
            'unit_cost' => $unitCost,
            'balance_after' => round($balanceAfter, 3),
            'reference_type' => $reference?->getMorphClass(),
            'reference_id' => $reference?->getKey(),
            'notes' => $notes,
        ]);
    }

    /**
     * A movement's sign must agree with its type, otherwise the ledger would read
     * as a sale that added stock.
     */
    private function assertDirectionMatchesType(float $delta, TransactionTypeEnum $type): void
    {
        if ($type->isPolarityFree()) {
            return;
        }

        $matches = match (true) {
            $type->increasesStock() => $delta > 0,
            $type->decreasesStock() => $delta < 0,
            default => true,
        };

        if (! $matches) {
            throw InvalidMovementException::directionMismatch($type, $delta);
        }
    }

    /**
     * The product and the branch must belong to the tenant making the request, and
     * to the same one as each other.
     *
     * The global scopes only apply to queries issued from here on, and by this
     * point the caller already holds both models — so without this check a
     * product fetched under a different tenant would be accepted and paired with
     * our branch.
     */
    private function assertSameTenant(Product $product, Branch $branch): void
    {
        $tenantId = Inventory::currentTenantId();

        if ($tenantId === null) {
            return;
        }

        if ((string) $product->tenant_id !== (string) $tenantId) {
            throw InventoryException::crossTenant(__('core::inventory.product'));
        }

        if ((string) $branch->tenant_id !== (string) $tenantId) {
            throw InventoryException::crossTenant(__('core::inventory.branch'));
        }
    }

    private function isUniqueViolation(QueryException $exception): bool
    {
        $sqlState = (string) ($exception->errorInfo[0] ?? $exception->getCode());
        $driverCode = (int) ($exception->errorInfo[1] ?? 0);

        return $sqlState === '23000' || $sqlState === '23505' || $driverCode === 1062;
    }
}
