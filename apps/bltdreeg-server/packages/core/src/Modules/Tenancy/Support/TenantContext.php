<?php

namespace Bltdreeg\Core\Modules\Tenancy\Support;

use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;

class TenantContext
{
    public ?Tenant $tenant = null;

    public function set(?Tenant $tenant): void
    {
        $this->tenant = $tenant;
    }

    public function id(): int|string|null
    {
        return $this->tenant?->getKey();
    }

    public function flush(): void
    {
        $this->tenant = null;
    }
}
