<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder as QueryBuilder;

/**
 * Barbers are employees, not a separate entity (spec §4.4): a user seated at the
 * branch whose job type for that tenant is flagged bookable. The pivot carries the
 * job type, so this reaches through `tenant_user` with the query builder — the
 * JobType model's tenant scope would otherwise depend on ambient context.
 */
final class BookableBarbers
{
    public static function query(Branch $branch): Builder
    {
        return User::query()
            ->where('users.branch_id', $branch->getKey())
            ->where('users.is_active', true)
            ->whereExists(fn (QueryBuilder $query) => $query
                ->from('tenant_user')
                ->join('job_types', 'job_types.id', '=', 'tenant_user.job_type_id')
                ->whereColumn('tenant_user.user_id', 'users.id')
                ->where('tenant_user.tenant_id', $branch->tenant_id)
                ->where('job_types.is_bookable', true)
                ->where('job_types.is_active', true))
            ->orderBy('users.name');
    }

    public static function forBranch(Branch $branch): Collection
    {
        return self::query($branch)->get();
    }

    public static function includes(Branch $branch, User $user): bool
    {
        return self::query($branch)->whereKey($user->getKey())->exists();
    }
}
