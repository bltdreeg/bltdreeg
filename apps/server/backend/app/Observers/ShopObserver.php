<?php

namespace App\Observers;

use App\Models\Role;
use App\Models\Shop;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class ShopObserver
{
    /**
     * Grant the super admin role to every super admin user when a shop is created,
     * so they retain access inside the new tenant's permission context.
     */
    public function created(Shop $shop): void
    {
        if (! config('filament-shield.super_admin.enabled', true)) {
            return;
        }

        $superAdmins = User::query()->where('is_super_admin', true)->get();

        if ($superAdmins->isEmpty()) {
            return;
        }

        $registrar = app(PermissionRegistrar::class);
        $previousTeamId = $registrar->getPermissionsTeamId();

        $registrar->setPermissionsTeamId($shop->getKey());

        $role = Role::firstOrCreate([
            'shop_id' => $shop->getKey(),
            'name' => config('filament-shield.super_admin.name', 'super_admin'),
            'guard_name' => 'web',
        ]);

        $role->syncPermissions(Permission::query()->get('id'));

        foreach ($superAdmins as $user) {
            $user->unsetRelation('roles')->unsetRelation('permissions');
            $user->assignRole($role);
        }

        $registrar->setPermissionsTeamId($previousTeamId);
    }
}
