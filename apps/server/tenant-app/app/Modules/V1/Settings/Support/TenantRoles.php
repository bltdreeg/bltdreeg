<?php

namespace App\Modules\V1\Settings\Support;

use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

final class TenantRoles
{
    public static function query(): Builder
    {
        $tenantId = Filament::getTenant()?->getKey();
        $forTenant = Role::query()->where('team_id', $tenantId);

        if ($tenantId !== null && (clone $forTenant)->exists()) {
            return $forTenant->orderByDesc('crm_role')->orderBy('name');
        }

        return Role::query()
            ->whereNull('team_id')
            ->where('crm_role', true)
            ->orderBy('name');
    }

    public static function assignableOptions(): array
    {
        return self::query()->pluck('name', 'name')->all();
    }

    public static function permissionOptions(): array
    {
        return Permission::query()
            ->where('crm_permission', true)
            ->orderBy('name')
            ->pluck('name', 'name')
            ->all();
    }

    public static function bindTeamContext(): void
    {
        app(PermissionRegistrar::class)
            ->setPermissionsTeamId(Filament::getTenant()?->getKey());
    }

    public static function isBuiltIn(Role $role): bool
    {
        return (bool) $role->crm_role;
    }
}
