<?php

use Bltdreeg\Core\Modules\Inventory\Enums\PurchaseStatusEnum;
use Bltdreeg\Core\Modules\Inventory\Enums\UnitEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Bltdreeg\Core\Modules\Inventory\Models\ProductCategory;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
 // ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/*
|--------------------------------------------------------------------------
| Inventory builders
|--------------------------------------------------------------------------
|
| Shared by the inventory service and panel tests. Every one of these creates its
| record with `withoutGlobalScopes()` and the tenant id passed in, because the
| point of most inventory tests is to control which tenant a row belongs to. The
| assertions then go through the ordinary scoped query to prove the scope holds.
|
*/

function makeInventoryTenant(string $name = 'Salon A'): Tenant
{
    $tenant = Tenant::factory()->create(['name' => $name]);

    app(TenantContext::class)->set($tenant);

    return $tenant;
}

function makeInventoryBranch(Tenant $tenant, string $name = 'Downtown'): Branch
{
    return Branch::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => $name,
        'is_active' => true,
    ]);
}

function makeInventoryProduct(Tenant $tenant, array $attributes = []): Product
{
    $category = ProductCategory::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Hair Care',
        'is_active' => true,
    ]);

    return Product::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'category_id' => $category->id,
        'name' => 'Shampoo',
        'sku' => 'SKU-'.fake()->unique()->numerify('####'),
        'image' => null,
        'price' => 20,
        'sale_price' => null,
        'unit' => UnitEnum::BOTTLE,
        'low_stock_threshold' => 5,
        'track_inventory' => true,
        'is_active' => true,
        ...$attributes,
    ]);
}

function makeInventoryRow(Tenant $tenant, Product $product, Branch $branch, float $quantity = 0): Inventory
{
    return Inventory::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'product_id' => $product->id,
        'quantity' => $quantity,
        'reserved_quantity' => 0,
    ]);
}

function makePurchase(Tenant $tenant, Branch $branch, Product $product, float $quantity = 8, float $unitCost = 10): Purchase
{
    $purchase = Purchase::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'purchase_number' => 'PO-'.fake()->unique()->numerify('####'),
        'purchase_date' => now()->toDateString(),
        'status' => PurchaseStatusEnum::DRAFT,
        'subtotal' => $quantity * $unitCost,
        'discount' => 0,
        'tax' => 0,
        'total' => $quantity * $unitCost,
    ]);

    $purchase->items()->create([
        'product_id' => $product->id,
        'quantity' => $quantity,
        'unit_cost' => $unitCost,
        'discount' => 0,
        'tax' => 0,
        'total' => $quantity * $unitCost,
    ]);

    return $purchase;
}
