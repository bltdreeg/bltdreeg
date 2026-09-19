<?php

namespace Bltdreeg\Core\Concerns;

use Bltdreeg\Core\Support\BranchContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToBranch
{
    public static function bootBelongsToBranch(): void
    {
        static::addGlobalScope('branch', function (Builder $builder): void {
            $branchId = static::currentBranchId();

            if ($branchId === null) {
                return;
            }

            $column = static::branchScopeColumn();

            $builder->where($builder->getModel()->qualifyColumn($column), $branchId);
        });

        static::creating(function (Model $model): void {
            if (! static::branchAutoAssignOnCreate()) {
                return;
            }

            if ($model->getAttribute('branch_id')) {
                return;
            }

            $branchId = static::currentBranchId();

            if ($branchId !== null) {
                $model->setAttribute('branch_id', $branchId);
            }
        });
    }

    public static function branchScopeColumn(): string
    {
        return 'branch_id';
    }

    protected static function branchAutoAssignOnCreate(): bool
    {
        return true;
    }

    public static function currentBranchId(): int|string|null
    {
        return app(BranchContext::class)->id();
    }
}