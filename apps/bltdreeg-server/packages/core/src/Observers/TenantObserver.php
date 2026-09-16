<?php

namespace Bltdreeg\Core\Observers;

use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Support\TenantProvisioner;

class TenantObserver
{
    public function __construct(private TenantProvisioner $provisioner) {}

    public function created(Tenant $tenant): void
    {
        $this->provisioner->provision($tenant);
    }
}
