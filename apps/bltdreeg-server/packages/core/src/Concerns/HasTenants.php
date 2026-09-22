<?php

namespace Bltdreeg\Core\Concerns;

use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\UserTenant;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

trait HasTenants
{
    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_user', 'user_id', 'tenant_id')
            ->using(UserTenant::class)
            ->withPivot(['job_type_id', 'shift_id'])
            ->withTimestamps();
    }

    public function allTenants(): Collection
    {
        return $this->tenants->sortBy('name')->values();
    }

    public function belongsToTenant(Tenant $tenant): bool
    {
        return $this->tenants()->whereKey($tenant->getKey())->exists();
    }
}
