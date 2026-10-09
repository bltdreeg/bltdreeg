<?php

namespace Bltdreeg\Core\Concerns;

use DateTimeInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;

/**
 * Transparently caches the static `find`/`findOrFail`/`all` lookups for the model,
 * so callers use plain Eloquent (`GeoCity::find($id)`) and get caching for free.
 * Queries built through `static::query()` (joins, wheres, ordering, ...) are never
 * cached — only these whole-model-by-key/whole-table shortcuts are.
 *
 * If the model also uses `BelongsToTenant`, cache keys are namespaced by the
 * current tenant: that global scope is only enforced on a cache miss, so without
 * namespacing, a cache hit would hand one tenant's row to another tenant's request.
 *
 * Only a model's raw attributes are cached, never the model object itself: this
 * app's `config('cache.serializable_classes')` is `false` (Laravel's gadget-chain
 * hardening default), so the cache store silently turns any cached object back
 * into `__PHP_Incomplete_Class` on read. Caching plain arrays sidesteps that,
 * and is cheaper besides.
 *
 * @method static Builder query()
 * @method static void saved(\Closure|callable|array|class-string $callback)
 * @method static void deleted(\Closure|callable|array|class-string $callback)
 * @mixin Model
 */
trait CachableModel
{
    public static function bootCachableModel(): void
    {
        static::saved(fn (self $model) => $model->flushModelCache());
        static::deleted(fn (self $model) => $model->flushModelCache());
    }

    public static function find(mixed $id, array|string $columns = ['*']): ?static
    {
        if (is_array($id) || $id instanceof Arrayable || $columns !== ['*']) {
            return static::query()->find($id, $columns);
        }

        if (blank($id)) {
            return null;
        }

        $attributes = Cache::remember(
            static::cacheKeyForId($id),
            static::cacheTtl(),
            fn () => static::query()->find($id)?->getAttributes(),
        );

        return $attributes === null ? null : (new static)->newFromBuilder($attributes);
    }

    public static function findOrFail(mixed $id, array|string $columns = ['*']): static
    {
        $model = static::find($id, $columns);

        if ($model === null) {
            throw (new ModelNotFoundException)->setModel(static::class, $id);
        }

        return $model;
    }

    public static function all($columns = ['*']): Collection
    {
        if ($columns !== ['*']) {
            return static::query()->get($columns);
        }

        $rows = Cache::remember(
            static::cacheKeyForAll(),
            static::cacheTtl(),
            fn () => static::query()->get()->map->getAttributes()->all(),
        );

        $instance = new static;

        return $instance->newCollection(
            array_map(fn (array $attributes) => $instance->newFromBuilder($attributes), $rows)
        );
    }

    public static function cacheTtl(): DateTimeInterface
    {
        return now()->addDays(30);
    }

    /**
     * Cache any other model-scoped query (a raw value, a custom shape, ...) under
     * this model's own cache prefix and tenant segment, instead of reaching for
     * `Cache::remember()` with a hand-rolled key next to the model's queries.
     *
     * $callback must return scalars/arrays only — never a model or object, for the
     * same reason `find()`/`all()` cache raw attributes instead of objects (see
     * the class docblock).
     */
    public static function remember(string $key, \Closure $callback, ?DateTimeInterface $ttl = null): mixed
    {
        return Cache::remember(
            static::cacheKeyFor($key),
            $ttl ?? static::cacheTtl(),
            $callback,
        );
    }

    public static function cacheKeyFor(string $key): string
    {
        return strtolower(class_basename(static::class)).static::currentTenantCacheSegment().":{$key}";
    }

    public static function cacheKeyForId(string|int $id): string
    {
        return static::cacheKeyFor((string) $id);
    }

    public static function cacheKeyForAll(): string
    {
        return static::cacheKeyFor('all');
    }

    /**
     * Empty for models without `BelongsToTenant`. Otherwise the current request's
     * tenant id, so reads never return another tenant's cached row on a cache hit.
     */
    protected static function currentTenantCacheSegment(): string
    {
        if (! method_exists(static::class, 'currentTenantId')) {
            return '';
        }

        $tenantId = call_user_func([static::class, 'currentTenantId']);

        return $tenantId === null ? '' : ":tenant:{$tenantId}";
    }

    public function flushModelCache(): void
    {
        $prefix = strtolower(class_basename(static::class)).$this->ownTenantCacheSegment();

        Cache::forget("{$prefix}:{$this->getKey()}");
        Cache::forget("{$prefix}:all");
    }

    /**
     * Same as `currentTenantCacheSegment()`, but keyed off this record's own
     * `tenant_id` rather than the ambient request context, so a save made outside
     * that tenant's context (an admin edit, a queued job, ...) still invalidates
     * the right cache entry.
     */
    protected function ownTenantCacheSegment(): string
    {
        if (! method_exists(static::class, 'currentTenantId')) {
            return '';
        }

        $tenantId = $this->getAttribute('tenant_id');

        return $tenantId === null ? '' : ":tenant:{$tenantId}";
    }
}
