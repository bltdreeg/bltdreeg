<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Support;

use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Bltdreeg\Core\Modules\Inventory\Models\ProductCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * The single place pickers and tables ask "what may this tenant see?".
 *
 * Every model reached from here carries the `BelongsToTenant` global scope, and
 * this class adds an explicit `tenant_id` filter on top. The two together are
 * what stops a tenant reaching another tenant's rows: the global scope is inert
 * whenever `TenantContext` is unset (console, queue, Octane), and the explicit
 * filter still pins the query to the panel's tenant — degrading to a deny-all
 * (`tenant_id is null`) rather than an unfiltered table.
 *
 * That is why nothing here falls back to "no filter" when the tenant is null.
 */
class InventoryDirectory
{
    public static function tenantId(): int|string|null
    {
        return Filament::getTenant()?->getKey();
    }

    /**
     * Pin any tenant-scoped query to the current panel tenant.
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    public static function scopeToTenant(Builder $query): Builder
    {
        return $query->where($query->getModel()->qualifyColumn('tenant_id'), self::tenantId());
    }

    /**
     * Branch names are translatable JSON, so read them per-locale instead of
     * plucking the raw column (which would render as an array).
     */
    public static function branchLabel(Branch $branch): string
    {
        $name = $branch->getTranslation('name', app()->getLocale())
            ?: $branch->getTranslation('name', config('app.fallback_locale', 'en'));

        return (string) ($name ?: "#{$branch->getKey()}");
    }

    /**
     * @return Collection<int, Branch>
     */
    public static function branches(bool $activeOnly = true): Collection
    {
        return self::scopeToTenant(Branch::query())
            ->when($activeOnly, fn (Builder $query): Builder => $query->where('is_active', true))
            ->get()
            ->sortBy(fn (Branch $branch): string => self::branchLabel($branch))
            ->values();
    }

    /**
     * @return array<int|string, string>
     */
    public static function branchOptions(bool $activeOnly = true): array
    {
        return self::branches($activeOnly)
            ->mapWithKeys(fn (Branch $branch): array => [$branch->getKey() => self::branchLabel($branch)])
            ->all();
    }

    /**
     * @return Collection<int, ProductCategory>
     */
    public static function categories(bool $activeOnly = false): Collection
    {
        return self::scopeToTenant(ProductCategory::query())
            ->when($activeOnly, fn (Builder $query): Builder => $query->where('is_active', true))
            ->orderBy('name')
            ->get();
    }

    /**
     * @return array<int|string, string>
     */
    public static function categoryOptions(bool $activeOnly = false): array
    {
        return self::categories($activeOnly)
            ->mapWithKeys(fn (ProductCategory $category): array => [$category->getKey() => $category->name])
            ->all();
    }

    /**
     * @return Collection<int, Product>
     */
    public static function products(bool $activeOnly = false, bool $trackedOnly = false): Collection
    {
        return self::scopeToTenant(Product::query())
            ->with('category')
            ->when($activeOnly, fn (Builder $query): Builder => $query->where('is_active', true))
            ->when($trackedOnly, fn (Builder $query): Builder => $query->where('track_inventory', true))
            ->orderBy('name')
            ->get();
    }

    /**
     * @return array<int|string, string>
     */
    public static function productOptions(bool $activeOnly = false, bool $trackedOnly = false): array
    {
        return self::products($activeOnly, $trackedOnly)
            ->mapWithKeys(fn (Product $product): array => [$product->getKey() => $product->name])
            ->all();
    }

    /**
     * Name for a single product id, for labelling repeater rows where a full
     * options list would be wasteful.
     */
    public static function productName(int|string|null $productId): ?string
    {
        if ($productId === null || $productId === '') {
            return null;
        }

        return self::products()
            ->firstWhere('id', $productId)
            ?->name;
    }
}
