<?php

namespace Bltdreeg\Core\Support;

use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Spatie\Permission\PermissionRegistrar;

class TenantProvisioner
{
    public function provision(Tenant $tenant): void
    {
        $this->ensurePermissions();
        $this->grantSuperAdmin($tenant);
    }

    public function ensurePermissions(): void
    {
        $permissionClass = $this->permissionClass();
        $registrar = app(PermissionRegistrar::class);

        $registrar->forgetCachedPermissions();

        foreach (ShieldPermissions::names() as $name) {
            $permissionClass::query()->firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
            );
        }

        $registrar->forgetCachedPermissions();
    }

    public function syncSuperAdminAccess(User $user): void
    {
        $this->ensurePermissions();

        if ($user->is_super_admin) {
            Tenant::query()->each(fn (Tenant $tenant) => $this->grantSuperAdmin($tenant));

            return;
        }

        $this->revokeSuperAdminRoles($user);
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
        $this->assignTenantSuperAdminRole($tenant, $user);

        return $user;
    }

    public function grantSuperAdmin(Tenant $tenant): void
    {
        if (! config('filament-shield.super_admin.enabled', true)) {
            return;
        }

        $this->ensurePermissions();

        $superAdmins = User::query()->where('is_super_admin', true)->get();

        if ($superAdmins->isEmpty()) {
            return;
        }

        $registrar = app(PermissionRegistrar::class);
        $previousTeamId = $registrar->getPermissionsTeamId();
        $registrar->setPermissionsTeamId($tenant->getKey());

        $roleClass = $this->roleClass();
        $permissionClass = $this->permissionClass();

        $role = $roleClass::firstOrCreate([
            'tenant_id' => $tenant->getKey(),
            'name' => config('filament-shield.super_admin.name', 'super_admin'),
            'guard_name' => 'web',
        ], [
            'is_system' => true,
        ]);

        if (! $role->is_system) {
            $role->forceFill(['is_system' => true])->save();
        }

        $role->syncPermissions($permissionClass::query()->pluck('name')->all());

        foreach ($superAdmins as $user) {
            $user->unsetRelation('roles')->unsetRelation('permissions');
            $user->assignRole($role);
        }

        $registrar->setPermissionsTeamId($previousTeamId);
    }

    public function revokeSuperAdminRoles(User $user): void
    {
        $roleName = config('filament-shield.super_admin.name', 'super_admin');
        $registrar = app(PermissionRegistrar::class);
        $previousTeamId = $registrar->getPermissionsTeamId();

        Tenant::query()->each(function (Tenant $tenant) use ($user, $roleName, $registrar): void {
            $registrar->setPermissionsTeamId($tenant->getKey());
            $user->unsetRelation('roles')->unsetRelation('permissions');

            if ($user->hasRole($roleName)) {
                $user->removeRole($roleName);
            }
        });

        $registrar->setPermissionsTeamId($previousTeamId);
    }

    public function assignTenantSuperAdminRole(Tenant $tenant, User $user): void
    {
        if (! config('filament-shield.super_admin.enabled', true)) {
            return;
        }

        $this->ensurePermissions();

        $registrar = app(PermissionRegistrar::class);
        $previousTeamId = $registrar->getPermissionsTeamId();
        $registrar->setPermissionsTeamId($tenant->getKey());

        $roleClass = $this->roleClass();
        $permissionClass = $this->permissionClass();

        $role = $roleClass::firstOrCreate([
            'tenant_id' => $tenant->getKey(),
            'name' => config('filament-shield.super_admin.name', 'super_admin'),
            'guard_name' => 'web',
        ], [
            'is_system' => true,
        ]);

        if (! $role->is_system) {
            $role->forceFill(['is_system' => true])->save();
        }

        $role->syncPermissions($permissionClass::query()->pluck('name')->all());

        $user->unsetRelation('roles')->unsetRelation('permissions');
        $user->assignRole($role);

        $registrar->setPermissionsTeamId($previousTeamId);
    }

    /**
     * @return class-string
     */
    private function roleClass(): string
    {
        return config('permission.models.role');
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
