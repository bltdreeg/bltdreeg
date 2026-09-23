<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Tenancy\Support;

use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Auth\Support\ShieldPermissions;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;

class TenantProvisioner
{
    public function provision(Tenant $tenant): void
    {
        $this->ensurePermissions();
        $this->ensureOwnerRole($tenant);
    }

    public function ensurePermissions(): void
    {
        $permissionClass = $this->permissionClass();
        $registrar = app(\Spatie\Permission\PermissionRegistrar::class);

        $registrar->forgetCachedPermissions();

        foreach (ShieldPermissions::all() as $name) {
            $permissionClass::query()->firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
            );
        }

        $registrar->forgetCachedPermissions();
    }

    /**
     * Platform super admins no longer receive tenant roles — Gate::before covers them.
     */
    public function syncSuperAdminAccess(User $user): void
    {
        if ($user->is_super_admin) {
            $this->revokeOwnerRoles($user);

            return;
        }

        $this->revokeOwnerRoles($user);
    }

    public function createTenantOwner(Tenant $tenant, string $name, string $email, string $password, ?string $phone = null): User
    {
        $user = User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'phone' => $phone ?: $this->uniqueOwnerPhone($tenant),
            'is_active' => true,
            'is_super_admin' => false,
            'email_verified_at' => now(),
        ]);

        $user->tenants()->syncWithoutDetaching([$tenant->getKey()]);
        $this->assignOwnerRole($tenant, $user);

        return $user;
    }

    public function ensureOwnerRole(Tenant $tenant): Role
    {
        $this->ensurePermissions();

        $role = Role::withoutGlobalScopes()->firstOrCreate(
            [
                'tenant_id' => $tenant->getKey(),
                'name' => $this->ownerRoleName(),
                'guard_name' => 'web',
            ],
            [
                'is_system' => true,
            ],
        );

        if (! $role->is_system) {
            $role->forceFill(['is_system' => true])->save();
        }

        $role->syncPermissions(ShieldPermissions::tenant());

        return $role->fresh();
    }

    public function assignOwnerRole(Tenant $tenant, User $user): void
    {
        $role = $this->ensureOwnerRole($tenant);

        $user->unsetRelation('roles')->unsetRelation('permissions');
        $user->assignRole($role);
    }

    /**
     * @deprecated Use assignOwnerRole()
     */
    public function assignTenantSuperAdminRole(Tenant $tenant, User $user): void
    {
        $this->assignOwnerRole($tenant, $user);
    }

    public function revokeOwnerRoles(User $user): void
    {
        $roleName = $this->ownerRoleName();

        $roles = Role::withoutGlobalScopes()
            ->where('name', $roleName)
            ->where('is_system', true)
            ->get();

        $user->unsetRelation('roles')->unsetRelation('permissions');

        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                $user->removeRole($role);
            }
        }
    }

    private function ownerRoleName(): string
    {
        return config('filament-shield.super_admin.name', 'owner');
    }

    /**
     * @return class-string
     */
    private function permissionClass(): string
    {
        return config('permission.models.permission');
    }

    private function uniqueOwnerPhone(Tenant $tenant): string
    {
        $phone = $tenant->phone;

        if (! User::query()->where('phone', $phone)->exists()) {
            return $phone;
        }

        do {
            $phone = 't'.$tenant->getKey().str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        } while (User::query()->where('phone', $phone)->exists());

        return $phone;
    }
}
