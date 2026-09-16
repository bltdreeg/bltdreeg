<?php

namespace Bltdreeg\Core\Support;

use Bltdreeg\Core\Models\Tenant;

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
