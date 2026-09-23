<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Auth\Models;


use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    use BelongsToTenant;

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'is_system' => 'boolean',
        ]);
    }

    public function sourceTemplate(): BelongsTo
    {
        return $this->belongsTo(RoleTemplate::class, 'source_template_id');
    }

    /**
     * Query roles for a specific tenant, bypassing the current-tenant global scope.
     */
    public static function forTenant(Tenant|int|string $tenant): Builder
    {
        $tenantId = $tenant instanceof Tenant ? $tenant->getKey() : $tenant;

        return static::withoutGlobalScope('tenant')->where(
            (new static)->qualifyColumn('tenant_id'),
            $tenantId,
        );
    }
}
