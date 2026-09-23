<?php

namespace Bltdreeg\Core\Modules\Tenancy\Observers;

use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantProvisioner;

class TenantObserver
{
    public function __construct(private TenantProvisioner $provisioner) {}

    public function created(Tenant $tenant): void
    {
        $this->provisioner->provision($tenant);
    }
}
