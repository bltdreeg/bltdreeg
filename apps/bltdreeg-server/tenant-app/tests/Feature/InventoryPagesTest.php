<?php

use App\Modules\V1\Inventory\Filament\Resources\Inventories\InventoryResource;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages\CreateInventory;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages\EditInventory;
use App\Modules\V1\Inventory\Filament\Resources\Inventories\Pages\ListInventories;
use App\Modules\V1\Inventory\Filament\Resources\InventoryTransactions\InventoryTransactionResource;
use App\Modules\V1\Inventory\Filament\Resources\InventoryTransactions\Pages\ListInventoryTransactions;
use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages\CreateProductCategory;
use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages\EditProductCategory;
use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages\ListProductCategories;
use App\Modules\V1\Inventory\Filament\Resources\Products\Pages\CreateProduct;
use App\Modules\V1\Inventory\Filament\Resources\Products\Pages\EditProduct;
use App\Modules\V1\Inventory\Filament\Resources\Products\Pages\ListProducts;
use App\Modules\V1\Inventory\Filament\Resources\Products\Pages\ViewProduct;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages\CreatePurchase;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages\EditPurchase;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages\ListPurchases;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages\ViewPurchase;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Inventory\Enums\TransactionTypeEnum;
use Bltdreeg\Core\Modules\Inventory\Enums\UnitEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Bltdreeg\Core\Modules\Inventory\Models\ProductCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

/**
 * Renders each panel page for real.
 *
 * Registration alone proves nothing: a mistyped column name, a filter closure
 * with the wrong signature or a malformed schema only fails when Livewire builds
 * the component. This walks every index, create, view and edit page, which is the
 * only way to know the screens actually open.
 */
beforeEach(function () {
    $this->tenant = Tenant::factory()->create(['name' => 'Salon A']);

    $user = User::factory()->create([
        'is_active' => true,
        'is_super_admin' => true,
        'email' => 'owner@salon.test',
    ]);

    // Membership is a pivot, not a column on the user.
    $user->tenants()->attach($this->tenant->id);

    $this->actingAs($user);

    Filament::setCurrentPanel('app');
    Filament::setTenant($this->tenant);
});

it('offers a create action on every list page that can create a record', function () {
    // A `create` route is not enough on its own: in Filament v5 the button only
    // appears when the list page declares a CreateAction header action.
    Livewire::test(ListProductCategories::class)
        ->assertSuccessful()
        ->assertActionExists('create');

    Livewire::test(ListProducts::class)
        ->assertSuccessful()
        ->assertActionExists('create');

    Livewire::test(ListPurchases::class)
        ->assertSuccessful()
        ->assertActionExists('create');
});

it('offers no create action on the append-only movement ledger', function () {
    // Movements are written by the services, never typed in, so the ledger
    // resource stays read-only.
    expect(InventoryTransactionResource::getPages())->not->toHaveKey('create')
        ->and(InventoryTransactionResource::getPages())->not->toHaveKey('edit');

    Livewire::test(ListInventoryTransactions::class)
        ->assertSuccessful()
        ->assertActionDoesNotExist('create');
});

it('creates and edits a stock row while keeping the ledger in step', function () {
    $product = makeInventoryProduct($this->tenant);
    $branch = makeInventoryBranch($this->tenant, 'Main');

    Livewire::test(ListInventories::class)
        ->assertSuccessful()
        ->assertActionExists('create');

    // Creating with an opening quantity must produce a movement, not just a row.
    Livewire::test(CreateInventory::class)
        ->assertSuccessful()
        ->fillForm([
            'product_id' => $product->id,
            'branch_id' => $branch->id,
            'quantity' => 12,
            'reserved_quantity' => 2,
            'notes' => 'Opening count',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $inventory = Inventory::withoutGlobalScopes()
        ->where('product_id', $product->id)
        ->where('branch_id', $branch->id)
        ->firstOrFail();

    expect((float) $inventory->quantity)->toBe(12.0)
        ->and((float) $inventory->reserved_quantity)->toBe(2.0)
        ->and(InventoryTransaction::withoutGlobalScopes()
            ->where('inventory_id', $inventory->id)
            ->where('type', TransactionTypeEnum::ADJUSTMENT)
            ->count())->toBe(1);

    // Editing the quantity is a stock take: the difference becomes an adjustment.
    Livewire::test(EditInventory::class, ['record' => $inventory->getKey()])
        ->assertSuccessful()
        ->fillForm([
            'quantity' => 9,
            'reserved_quantity' => 1,
            'notes' => 'Recount',
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $inventory->refresh();

    expect((float) $inventory->quantity)->toBe(9.0)
        ->and((float) $inventory->reserved_quantity)->toBe(1.0);

    $movements = InventoryTransaction::withoutGlobalScopes()
        ->where('inventory_id', $inventory->id)
        ->orderBy('id')
        ->get();

    expect($movements)->toHaveCount(2)
        ->and((float) $movements[0]->quantity)->toBe(12.0)
        ->and((float) $movements[0]->balance_after)->toBe(12.0)
        ->and((float) $movements[1]->quantity)->toBe(-3.0)
        ->and((float) $movements[1]->balance_after)->toBe(9.0);
});

it('refuses to reserve more stock than the row holds', function () {
    $product = makeInventoryProduct($this->tenant);
    $branch = makeInventoryBranch($this->tenant, 'Main');
    $inventory = makeInventoryRow($this->tenant, $product, $branch, 4);

    Livewire::test(EditInventory::class, ['record' => $inventory->getKey()])
        ->assertSuccessful()
        ->fillForm(['quantity' => 4, 'reserved_quantity' => 9, 'notes' => null])
        ->call('save');

    expect((float) $inventory->fresh()->reserved_quantity)->toBe(0.0)
        ->and((float) $inventory->fresh()->quantity)->toBe(4.0);
})->skip(false);

it('never offers to delete a stock row', function () {
    $product = makeInventoryProduct($this->tenant);
    $branch = makeInventoryBranch($this->tenant, 'Main');
    $inventory = makeInventoryRow($this->tenant, $product, $branch, 4);

    expect(InventoryResource::canDelete($inventory))->toBeFalse()
        ->and(InventoryResource::getPages())->not->toHaveKey('delete');
});

it('opens the product category pages', function () {
    $category = ProductCategory::withoutGlobalScopes()->create([
        'tenant_id' => $this->tenant->id,
        'name' => 'Hair Care',
        'is_active' => true,
    ]);

    Livewire::test(ListProductCategories::class)
        ->assertSuccessful();

    Livewire::test(CreateProductCategory::class)
        ->assertSuccessful()
        ->fillForm(['name' => 'Nails', 'is_active' => true])
        ->call('create')
        ->assertHasNoFormErrors();

    Livewire::test(EditProductCategory::class, ['record' => $category->getKey()])
        ->assertSuccessful();
});

it('opens the product pages', function () {
    $product = makeInventoryProduct($this->tenant);

    Livewire::test(ListProducts::class)
        ->assertSuccessful()
        ->assertCanSeeTableRecords([$product]);

    Livewire::test(CreateProduct::class)
        ->assertSuccessful()
        ->fillForm([
            'name' => 'Conditioner',
            'sku' => 'SKU-COND-1',
            'price' => 24,
            'sale_price' => 18,
            'unit' => UnitEnum::BOTTLE,
            'low_stock_threshold' => 4,
            'track_inventory' => true,
            'is_active' => true,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    Livewire::test(ViewProduct::class, ['record' => $product->getKey()])
        ->assertSuccessful();

    Livewire::test(EditProduct::class, ['record' => $product->getKey()])
        ->assertSuccessful()
        ->fillForm(['name' => 'Shampoo 2L'])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($product->fresh()->name)->toBe('Shampoo 2L');
});

it('rejects a discount price above the regular price', function () {
    Livewire::test(CreateProduct::class)
        ->fillForm([
            'name' => 'Conditioner',
            'sku' => 'SKU-COND-9',
            'price' => 24,
            'sale_price' => 30,
            'unit' => UnitEnum::BOTTLE,
        ])
        ->call('create')
        ->assertHasFormErrors(['sale_price']);
});

it('opens the stock pages', function () {
    $product = makeInventoryProduct($this->tenant);
    $branch = makeInventoryBranch($this->tenant, 'Main');
    $inventory = makeInventoryRow($this->tenant, $product, $branch, 6);

    Livewire::test(ListInventories::class)
        ->assertSuccessful()
        ->assertCanSeeTableRecords([$inventory]);

    // The stock-take action is the only way to change a quantity.
    Livewire::test(ListInventories::class)
        ->callTableAction('adjust', $inventory, [
            'quantity' => 4,
            'notes' => 'One bottle spoiled.',
        ])
        ->assertHasNoActionErrors();

    expect((float) $inventory->fresh()->quantity)->toBe(4.0);
});

it('opens the purchase pages and receives a draft', function () {
    $product = makeInventoryProduct($this->tenant);
    $branch = makeInventoryBranch($this->tenant, 'Main');
    $purchase = makePurchase($this->tenant, $branch, $product);

    Livewire::test(ListPurchases::class)
        ->assertSuccessful()
        ->assertCanSeeTableRecords([$purchase]);

    Livewire::test(CreatePurchase::class)
        ->assertSuccessful()
        ->fillForm([
            'branch_id' => $branch->id,
            'purchase_date' => now()->toDateString(),
            'supplier_name' => 'Beauty Supply',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 4, 'unit_cost' => 10, 'discount' => 0, 'tax' => 0],
            ],
            'discount' => 0,
            'tax' => 0,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    Livewire::test(ViewPurchase::class, ['record' => $purchase->getKey()])
        ->assertSuccessful()
        ->callAction('receive')
        ->assertHasNoActionErrors();

    expect($purchase->fresh()->isReceived())->toBeTrue()
        ->and((float) $product->inventoryFor($branch->id)->quantity)->toBe(8.0);

    Livewire::test(EditPurchase::class, ['record' => $purchase->getKey()])
        ->assertSuccessful();
});

it('opens the stock movement pages', function () {
    $product = makeInventoryProduct($this->tenant);
    $branch = makeInventoryBranch($this->tenant, 'Main');
    $inventory = makeInventoryRow($this->tenant, $product, $branch, 5);

    $movement = InventoryTransaction::withoutGlobalScopes()->create([
        'tenant_id' => $this->tenant->id,
        'branch_id' => $branch->id,
        'product_id' => $product->id,
        'inventory_id' => $inventory->id,
        'type' => TransactionTypeEnum::PURCHASE,
        'quantity' => 5,
        'balance_after' => 5,
    ]);

    Livewire::test(ListInventoryTransactions::class)
        ->assertSuccessful()
        ->assertCanSeeTableRecords([$movement]);
});

it('offers no way to edit or delete a stock movement', function () {
    $product = makeInventoryProduct($this->tenant);
    $branch = makeInventoryBranch($this->tenant, 'Main');
    $inventory = makeInventoryRow($this->tenant, $product, $branch, 5);

    $movement = InventoryTransaction::withoutGlobalScopes()->create([
        'tenant_id' => $this->tenant->id,
        'branch_id' => $branch->id,
        'product_id' => $product->id,
        'inventory_id' => $inventory->id,
        'type' => TransactionTypeEnum::PURCHASE,
        'quantity' => 5,
        'balance_after' => 5,
    ]);

    expect(InventoryTransactionResource::canCreate())->toBeFalse()
        ->and(InventoryTransactionResource::canEdit($movement))->toBeFalse()
        ->and(InventoryTransactionResource::canDelete($movement))->toBeFalse();
});

it('shows the other tenant nothing', function () {
    $theirTenant = Tenant::factory()->create(['name' => 'Salon B']);
    $theirBranch = makeInventoryBranch($theirTenant, 'Theirs');
    $theirProduct = makeInventoryProduct($theirTenant);
    makeInventoryRow($theirTenant, $theirProduct, $theirBranch, 99);

    Livewire::test(ListInventories::class)
        ->assertSuccessful()
        ->assertCanNotSeeTableRecords(Inventory::withoutGlobalScopes()->get());

    Livewire::test(ListProducts::class)
        ->assertSuccessful()
        ->assertCanNotSeeTableRecords([$theirProduct]);

    Livewire::test(ListInventoryTransactions::class)
        ->assertSuccessful()
        ->assertDontSee('Theirs');
});
