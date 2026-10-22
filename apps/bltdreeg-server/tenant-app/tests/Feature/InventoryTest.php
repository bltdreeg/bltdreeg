<?php

use App\Modules\V1\Inventory\Exceptions\InsufficientStockException;
use App\Modules\V1\Inventory\Exceptions\InvalidMovementException;
use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Exceptions\PurchaseAlreadyReceivedException;
use App\Modules\V1\Inventory\Exceptions\PurchaseNotEditableException;
use App\Modules\V1\Inventory\Services\InventoryService;
use App\Modules\V1\Inventory\Services\PurchaseService;
use Bltdreeg\Core\Modules\Inventory\Enums\PurchaseStatusEnum;
use Bltdreeg\Core\Modules\Inventory\Enums\TransactionTypeEnum;
use Bltdreeg\Core\Modules\Inventory\Enums\UnitEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Bltdreeg\Core\Modules\Inventory\Models\PurchaseItem;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Exception messages are translated, so a test that switches locale would
 * otherwise change what every later test asserts on.
 */
beforeEach(function () {
    app()->setLocale(config('app.locale'));
});

afterEach(function () {
    app()->setLocale(config('app.locale'));
});

// --- tenancy -----------------------------------------------------------------

test('inventory queries are scoped to the current tenant', function () {
    $tenantA = makeInventoryTenant('Salon A');
    $branchA = makeInventoryBranch($tenantA);
    $productA = makeInventoryProduct($tenantA);
    $inventoryA = makeInventoryRow($tenantA, $productA, $branchA, 7);

    $tenantB = makeInventoryTenant('Salon B');
    $branchB = makeInventoryBranch($tenantB);
    $productB = makeInventoryProduct($tenantB);
    makeInventoryRow($tenantB, $productB, $branchB, 3);

    app(TenantContext::class)->set($tenantA);

    // Salon B's stock row exists but must be invisible from Salon A.
    expect(Product::query()->pluck('id')->all())->toBe([$productA->id])
        ->and(Inventory::query()->pluck('id')->all())->toBe([$inventoryA->id]);
});

test('products of another tenant cannot be moved as if they were ours', function () {
    $tenantB = Tenant::factory()->create(['name' => 'Other']);
    $productB = makeInventoryProduct($tenantB);

    $tenantA = makeInventoryTenant('Salon A');
    $branchA = makeInventoryBranch($tenantA);

    app(TenantContext::class)->set($tenantA);

    expect(fn () => app(InventoryService::class)->increase($productB, $branchA, 5))
        ->toThrow(InventoryException::class);

    // Nothing may be written, in this tenant or the other one.
    expect(Inventory::withoutGlobalScopes()->count())->toBe(0)
        ->and(InventoryTransaction::withoutGlobalScopes()->count())->toBe(0);
});

// --- stock movements ---------------------------------------------------------

test('a purchase movement adds stock and records the resulting balance', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);

    $transaction = app(InventoryService::class)->increase(
        product: $product,
        branch: $branch,
        quantity: 10,
        type: TransactionTypeEnum::PURCHASE,
        unitCost: 12.50,
    );

    expect($transaction)->toBeInstanceOf(InventoryTransaction::class)
        ->and((float) $transaction->quantity)->toBe(10.0)
        ->and((float) $transaction->balance_after)->toBe(10.0)
        ->and($transaction->type)->toBe(TransactionTypeEnum::PURCHASE)
        ->and((float) $transaction->unit_cost)->toBe(12.5);

    // A row is created on first movement, so the product is now stocked here.
    expect($product->inventoryFor($branch->id))->not->toBeNull()
        ->and((float) $product->inventoryFor($branch->id)->quantity)->toBe(10.0);
});

test('balance after is the running total across movements', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);
    $service = app(InventoryService::class);

    $service->increase($product, $branch, 20, TransactionTypeEnum::PURCHASE);
    $service->decrease($product, $branch, 7, TransactionTypeEnum::SALE);
    $service->increase($product, $branch, 3, TransactionTypeEnum::RETURN);

    $balances = InventoryTransaction::query()
        ->orderBy('id')
        ->pluck('balance_after')
        ->map(fn ($value): float => (float) $value)
        ->all();

    expect($balances)->toBe([20.0, 13.0, 16.0])
        ->and((float) Inventory::query()->firstOrFail()->quantity)->toBe(16.0);
});

test('stock can never be driven below zero', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);
    $service = app(InventoryService::class);

    $service->increase($product, $branch, 5, TransactionTypeEnum::PURCHASE);

    expect(fn () => $service->decrease($product, $branch, 6, TransactionTypeEnum::SALE))
        ->toThrow(InsufficientStockException::class);

    // The rejected movement must leave no trace at all — not on the balance, and
    // not as an orphan ledger row.
    expect((float) Inventory::query()->firstOrFail()->quantity)->toBe(5.0)
        ->and(InventoryTransaction::query()->count())->toBe(1);
});

test('reserved stock counts against what a sale may take', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);
    $service = app(InventoryService::class);

    $service->increase($product, $branch, 5, TransactionTypeEnum::PURCHASE);
    Inventory::query()->firstOrFail()->forceFill(['reserved_quantity' => 3])->save();

    expect(fn () => $service->decrease($product, $branch, 3, TransactionTypeEnum::SALE))
        ->toThrow(InsufficientStockException::class);
});

test('a movement whose sign contradicts its type is rejected', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);

    expect(fn () => app(InventoryService::class)->move($product, $branch, 5, TransactionTypeEnum::SALE))
        ->toThrow(InvalidMovementException::class)
        ->and(fn () => app(InventoryService::class)->move($product, $branch, 0, TransactionTypeEnum::ADJUSTMENT))
        ->toThrow(InvalidMovementException::class);
});

test('a transfer moves stock out of one branch and into another', function () {
    $tenant = makeInventoryTenant('Salon A');
    $main = makeInventoryBranch($tenant, 'Main');
    $annex = makeInventoryBranch($tenant, 'Annex');
    $product = makeInventoryProduct($tenant);
    $service = app(InventoryService::class);

    $service->increase($product, $main, 10, TransactionTypeEnum::PURCHASE);
    $service->transfer($product, $main, $annex, 4);

    expect((float) $product->inventoryFor($main->id)->quantity)->toBe(6.0)
        ->and((float) $product->inventoryFor($annex->id)->quantity)->toBe(4.0)
        ->and($product->transactions()->pluck('type')->map(fn ($t) => $t->value)->all())
        ->toContain(TransactionTypeEnum::TRANSFER_OUT->value, TransactionTypeEnum::TRANSFER_IN->value);
});

test('a stock take records the gap as an adjustment', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);
    $service = app(InventoryService::class);

    $service->increase($product, $branch, 10, TransactionTypeEnum::PURCHASE);
    $inventory = $product->inventoryFor($branch->id);

    $transaction = $service->adjustTo($inventory, 7, notes: 'Two bottles broken in transit.');

    expect((float) $transaction->quantity)->toBe(-3.0)
        ->and((float) $transaction->balance_after)->toBe(7.0)
        ->and($transaction->type)->toBe(TransactionTypeEnum::ADJUSTMENT);
});

// --- purchases ---------------------------------------------------------------

test('receiving a purchase credits stock and locks the purchase', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);
    $service = app(PurchaseService::class);

    $purchase = $service->create(
        ['branch_id' => $branch->id, 'supplier_name' => 'Beauty Supply'],
        [['product_id' => $product->id, 'quantity' => 12, 'unit_cost' => 8]],
    );

    expect($purchase->status)->toBe(PurchaseStatusEnum::DRAFT)
        ->and(PurchaseItem::query()->count())->toBe(1)
        ->and($product->inventoryFor($branch->id))->toBeNull();

    $service->receive($purchase);

    expect($purchase->fresh()->status)->toBe(PurchaseStatusEnum::RECEIVED)
        ->and((float) $product->inventoryFor($branch->id)->quantity)->toBe(12.0);

    $movement = InventoryTransaction::query()->firstOrFail();
    expect($movement->type)->toBe(TransactionTypeEnum::PURCHASE)
        ->and($movement->reference_type)->toBe((new Purchase)->getMorphClass())
        ->and($movement->reference_id)->toBe($purchase->id);
});

test('a purchase cannot be received twice', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);
    $service = app(PurchaseService::class);

    $purchase = $service->create(
        ['branch_id' => $branch->id],
        [['product_id' => $product->id, 'quantity' => 5, 'unit_cost' => 4]],
    );

    $service->receive($purchase);

    expect(fn () => $service->receive($purchase->fresh()))
        ->toThrow(PurchaseAlreadyReceivedException::class);

    // Stock credited exactly once, not twice.
    expect((float) $product->inventoryFor($branch->id)->quantity)->toBe(5.0)
        ->and(InventoryTransaction::query()->count())->toBe(1);
});

test('a received purchase can no longer be edited', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);
    $service = app(PurchaseService::class);

    $purchase = $service->create(
        ['branch_id' => $branch->id],
        [['product_id' => $product->id, 'quantity' => 5, 'unit_cost' => 4]],
    );
    $service->receive($purchase);

    expect(fn () => $service->update($purchase->fresh(), ['branch_id' => $branch->id], [
        ['product_id' => $product->id, 'quantity' => 99, 'unit_cost' => 4],
    ]))->toThrow(PurchaseNotEditableException::class);
});

test('purchase totals are derived from the items rather than trusted from input', function () {
    $tenant = makeInventoryTenant('Salon A');
    $branch = makeInventoryBranch($tenant);
    $product = makeInventoryProduct($tenant);

    $purchase = app(PurchaseService::class)->create(
        ['branch_id' => $branch->id, 'tax' => 0, 'discount' => 0],
        [['product_id' => $product->id, 'quantity' => 3, 'unit_cost' => 10]],
    );

    expect((float) $purchase->subtotal)->toBe(30.0)
        ->and((float) $purchase->total)->toBe(30.0);
});

// --- pricing -----------------------------------------------------------------

test('a product charges its regular price until a discount is set', function () {
    $tenant = makeInventoryTenant('Salon A');

    $regular = makeInventoryProduct($tenant, ['price' => 40]);
    $discounted = makeInventoryProduct($tenant, ['price' => 40, 'sale_price' => 30]);

    expect($regular->isOnSale())->toBeFalse()
        ->and($regular->currentPrice())->toBe(40.0)
        ->and($discounted->isOnSale())->toBeTrue()
        ->and($discounted->currentPrice())->toBe(30.0);
});

// --- derived readings --------------------------------------------------------

test('product stock helpers aggregate across branches and respect tracking', function () {
    $tenant = makeInventoryTenant('Salon A');
    $main = makeInventoryBranch($tenant, 'Main');
    $annex = makeInventoryBranch($tenant, 'Annex');
    $product = makeInventoryProduct($tenant, ['low_stock_threshold' => 3]);

    makeInventoryRow($tenant, $product, $main, 5);
    makeInventoryRow($tenant, $product, $annex, 4);

    expect($product->totalStock())->toBe(9.0)
        ->and($product->availableStock())->toBe(9.0)
        ->and($product->isLowStock())->toBeFalse()
        ->and($product->isOutOfStock())->toBeFalse();

    $untracked = makeInventoryProduct($tenant, ['track_inventory' => false, 'sku' => null, 'barcode' => null]);
    makeInventoryRow($tenant, $untracked, $main, 2);

    expect($untracked->isLowStock())->toBeFalse()
        ->and($untracked->isOutOfStock())->toBeFalse();
});

test('an inventory row reports its own stock status against the product threshold', function () {
    $tenant = makeInventoryTenant('Salon A');
    $product = makeInventoryProduct($tenant, ['low_stock_threshold' => 5]);

    // A separate branch per row: (branch_id, product_id) is unique, so the same
    // pair cannot be stocked three times over.
    $empty = makeInventoryRow($tenant, $product, makeInventoryBranch($tenant, 'Empty'), 0);
    expect($empty->isOutOfStock())->toBeTrue()->and($empty->status())->toBe('out_of_stock');

    $low = makeInventoryRow($tenant, $product, makeInventoryBranch($tenant, 'Low'), 3);
    expect($low->isLowStock())->toBeTrue()->and($low->status())->toBe('low');

    $healthy = makeInventoryRow($tenant, $product, makeInventoryBranch($tenant, 'Healthy'), 9);
    expect($healthy->status())->toBe('in_stock');
});

test('a product unit is cast to the unit enum and every case is selectable', function () {
    $tenant = makeInventoryTenant();
    $product = makeInventoryProduct($tenant);

    expect($product->fresh()->unit)->toBe(UnitEnum::BOTTLE)
        ->and($product->fresh()->getRawOriginal('unit'))->toBe('bottle')
        ->and(Product::factory()->create(['tenant_id' => $tenant->id])->unit)->toBe(UnitEnum::PIECE)
        ->and(UnitEnum::BOTTLE->value)->toBe('bottle');

    $options = UnitEnum::options();

    expect($options)->toHaveCount(count(UnitEnum::cases()))
        ->and(array_keys($options))->toBe(array_column(UnitEnum::cases(), 'value'))
        ->and($options)->each->toBeString()->not->toBeEmpty();

    foreach (UnitEnum::cases() as $case) {
        expect($case->label())->not->toBe($case->name)
            ->and($case->label())->not->toContain('core::inventory');
    }
});

test('a product unit is translated rather than shown as a raw token', function () {
    $tenant = makeInventoryTenant();
    $product = makeInventoryProduct($tenant, ['unit' => UnitEnum::KILOGRAM]);

    app()->setLocale('en');
    expect($product->fresh()->unit->label())->toBe(__('core::inventory.unit_kilogram', locale: 'en'))
        ->and(__('core::inventory.unit_kilogram', locale: 'en'))->not->toBe('kilogram');

    app()->setLocale('ar');
    expect(__('core::inventory.unit_kilogram', locale: 'ar'))->not->toBe(__('core::inventory.unit_kilogram', locale: 'en'));
});

test('opening a stock row records the opening quantity as an adjustment', function () {
    $tenant = makeInventoryTenant('Opening');
    $main = makeInventoryBranch($tenant, 'Main');
    $product = makeInventoryProduct($tenant);

    $inventory = app(InventoryService::class)->open(
        product: $product,
        branch: $main,
        openingQuantity: 10,
        reservedQuantity: 3,
        notes: 'Opening count',
    );

    expect((float) $inventory->quantity)->toBe(10.0)
        ->and((float) $inventory->reserved_quantity)->toBe(3.0)
        ->and((float) $inventory->availableQuantity())->toBe(7.0);

    $movements = InventoryTransaction::withoutGlobalScopes()
        ->where('inventory_id', $inventory->id)
        ->get();

    // The balance must be explainable by the ledger, never just asserted.
    expect($movements)->toHaveCount(1)
        ->and((float) $movements->first()->quantity)->toBe(10.0)
        ->and((float) $movements->first()->balance_after)->toBe(10.0)
        ->and($movements->first()->type)->toBe(TransactionTypeEnum::ADJUSTMENT)
        ->and($movements->first()->notes)->toBe('Opening count');
});

test('opening a stock row with no quantity still creates it without a movement', function () {
    $tenant = makeInventoryTenant('Empty Opening');
    $main = makeInventoryBranch($tenant, 'Main');
    $product = makeInventoryProduct($tenant);

    $inventory = app(InventoryService::class)->open($product, $main);

    expect((float) $inventory->quantity)->toBe(0.0)
        ->and(InventoryTransaction::withoutGlobalScopes()
            ->where('inventory_id', $inventory->id)->count())->toBe(0);
});

test('a reservation can never exceed the quantity on hand', function () {
    $tenant = makeInventoryTenant('Reservation');
    $main = makeInventoryBranch($tenant, 'Main');
    $product = makeInventoryProduct($tenant);
    $inventory = makeInventoryRow($tenant, $product, $main, 4);

    $service = app(InventoryService::class);

    // The app's default locale is Arabic, so the message is asserted through the
    // numbers it interpolates rather than through English wording.
    expect(fn () => $service->setReserved($inventory, 4.001))
        ->toThrow(InventoryException::class, '4.001');

    $service->setReserved($inventory, 4);
    expect((float) $inventory->fresh()->reserved_quantity)->toBe(4.0)
        ->and((float) $inventory->fresh()->availableQuantity())->toBe(0.0);

    expect(fn () => $service->setReserved($inventory, -1))
        ->toThrow(InvalidMovementException::class);
});

test('opening the same product twice reuses the row instead of duplicating it', function () {
    $tenant = makeInventoryTenant('Reopen');
    $main = makeInventoryBranch($tenant, 'Main');
    $product = makeInventoryProduct($tenant);
    $service = app(InventoryService::class);

    $first = $service->open($product, $main, openingQuantity: 5);
    $second = $service->open($product, $main, openingQuantity: 8);

    expect($second->getKey())->toBe($first->getKey())
        ->and((float) $second->quantity)->toBe(8.0)
        ->and(Inventory::withoutGlobalScopes()
            ->where('product_id', $product->id)
            ->where('branch_id', $main->id)
            ->count())->toBe(1);
});
