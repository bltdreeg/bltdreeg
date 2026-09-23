<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Auth\Support;

use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Auth\Models\RoleTemplate;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;

class RoleTemplateImporter
{
    public function importTemplate(RoleTemplate $template, Tenant $tenant): Role
    {
        $role = Role::withoutGlobalScopes()->firstOrCreate(
            [
                'tenant_id' => $tenant->getKey(),
                'source_template_id' => $template->getKey(),
            ],
            [
                'name' => $template->name,
                'guard_name' => 'web',
                'is_system' => false,
            ],
        );

        if ($role->name !== $template->name) {
            $role->forceFill(['name' => $template->name])->save();
        }

        $role->syncPermissions(
            $template->permissions()->pluck('name')->all()
        );

        return $role->fresh();
    }
}
