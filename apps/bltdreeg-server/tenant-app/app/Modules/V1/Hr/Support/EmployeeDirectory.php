<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;

/**
 * Single source of truth for "which employees may the signed-in user see".
 *
 * A user pinned to a branch only ever sees that branch. Branch-free users — the
 * owners seeded with a null branch_id so they can roam every branch — fall back
 * to the branch they picked in the topbar switcher, so switching branches still
 * narrows the lists. A null result means "every branch in the tenant".
 */
class EmployeeDirectory
{
    public static function branchIdForCurrentUser(): int|string|null
    {
        $user = Filament::auth()->user();

        if ($user instanceof User && $user->branch_id !== null) {
            return $user->branch_id;
        }

        return app(BranchContext::class)->id();
    }

    public static function currentTenant(): ?Tenant
    {
        $tenant = Filament::getTenant();

        return $tenant instanceof Tenant ? $tenant : null;
    }

    /**
     * @return Builder<User>
     */
    public static function query(?Tenant $tenant = null): Builder
    {
        return self::queryInBranch($tenant ?? self::currentTenant(), self::branchIdForCurrentUser());
    }

    /**
     * @return Builder<User>
     */
    public static function queryInBranch(?Tenant $tenant, int|string|null $branchId): Builder
    {
        if (! $tenant instanceof Tenant) {
            return User::query()->whereKey(0);
        }

        return User::query()
            ->where('is_active', true)
            ->whereHas('tenants', fn (Builder $query): Builder => $query->whereKey($tenant->getKey()))
            ->when($branchId !== null, fn (Builder $query): Builder => $query->where('branch_id', $branchId));
    }

    /**
     * @return array<int|string, string>
     */
    public static function options(?Tenant $tenant = null): array
    {
        return self::query($tenant)
            ->orderBy('name')
            ->pluck('name', 'id')
            ->all();
    }

    /**
     * Narrows records that reach their branch through a user relation, such as
     * adjustments, which carry no branch_id of their own.
     *
     * @param  Builder<covariant Relation<covariant Model, covariant Model, covariant Builder>>  $query
     * @return Builder<covariant Relation<covariant Model, covariant Model, covariant Builder>>
     */
    public static function scopeToBranchOf(Builder $query, string $relation = 'user'): Builder
    {
        $branchId = self::branchIdForCurrentUser();

        return $query->when(
            $branchId !== null,
            fn (Builder $query): Builder => $query->whereHas(
                $relation,
                fn (Builder $query): Builder => $query->where('branch_id', $branchId)
            )
        );
    }
}
