<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory;

use App\Modules\V1\Inventory\Policies\InventoryPolicy;
use App\Modules\V1\Inventory\Policies\InventoryTransactionPolicy;
use App\Modules\V1\Inventory\Policies\ProductCategoryPolicy;
use App\Modules\V1\Inventory\Policies\ProductPolicy;
use App\Modules\V1\Inventory\Policies\PurchasePolicy;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory as CoreInventory;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction as CoreInventoryTransaction;
use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Bltdreeg\Core\Modules\Inventory\Models\Product as CoreProduct;
use Bltdreeg\Core\Modules\Inventory\Models\ProductCategory;
use Bltdreeg\Core\Modules\Inventory\Models\ProductCategory as CoreProductCategory;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase as CorePurchase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class InventoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // The Filament resources point at the app-level subclasses, but anything
        // that reaches for the core class directly (a relation resolved from a
        // core model, a queued job) must hit the same policy — hence both.
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(ProductCategory::class, ProductCategoryPolicy::class);
        Gate::policy(Inventory::class, InventoryPolicy::class);
        Gate::policy(Purchase::class, PurchasePolicy::class);
        Gate::policy(InventoryTransaction::class, InventoryTransactionPolicy::class);

        Gate::policy(CoreProduct::class, ProductPolicy::class);
        Gate::policy(CoreProductCategory::class, ProductCategoryPolicy::class);
        Gate::policy(CoreInventory::class, InventoryPolicy::class);
        Gate::policy(CorePurchase::class, PurchasePolicy::class);
        Gate::policy(CoreInventoryTransaction::class, InventoryTransactionPolicy::class);
    }
}
