<?php

declare(strict_types=1);

namespace App\Modules\V1\Roles\Services;

use App\Modules\V1\Roles\Models\Role;
use App\Support\DuplicateNaming;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\PermissionRegistrar;

class RoleService
{
    public function getGuardName(): string
    {
        return config('auth.defaults.guard', 'web');
    }

    /**
     * @param  array{name: string, permissions: array<int, string>}  $validated
     */
    public function create(array $validated, int|string $tenantId): Role
    {
        $this->setTeam($tenantId);

        $role = Role::query()->create([
            'name' => $validated['name'],
            'guard_name' => $this->getGuardName(),
            'tenant_id' => $tenantId,
            'is_system' => false,
            'created_by' => Auth::id(),
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);
        $this->forgetPermissionCache();

        return $role;
    }

    /**
     * @param  array{name?: string, permissions?: array<int, string>}  $validated
     */
    public function update(Role $role, array $validated, int|string $tenantId): Role
    {
        if ($role->is_system) {
            return $role;
        }

        $this->setTeam($tenantId);

        if (isset($validated['name'])) {
            $role->name = $validated['name'];
            $role->save();
        }

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        $this->forgetPermissionCache();

        return $role;
    }

    public function delete(Role $role): bool
    {
        if ($role->is_system) {
            return false;
        }

        $deleted = (bool) $role->delete();

        if ($deleted) {
            $this->forgetPermissionCache();
        }

        return $deleted;
    }

    /**
     * @param  list<int>  $ids
     */
    public function bulkDelete(array $ids, int|string $tenantId): int
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));

        if ($ids === []) {
            return 0;
        }

        $count = Role::query()
            ->where('tenant_id', $tenantId)
            ->where('guard_name', $this->getGuardName())
            ->where('is_system', false)
            ->whereIn('id', $ids)
            ->delete();

        if ($count > 0) {
            $this->forgetPermissionCache();
        }

        return $count;
    }

    public function duplicate(Role $source, int|string $tenantId): Role
    {
        return $this->bulkDuplicate([$source->getKey()], $tenantId)[0];
    }

    /**
     * @param  list<int>  $ids
     * @return list<Role>
     */
    public function bulkDuplicate(array $ids, int|string $tenantId): array
    {
        $this->setTeam($tenantId);

        $ids = array_values(array_unique(array_map('intval', $ids)));

        if ($ids === []) {
            return [];
        }

        $found = Role::query()
            ->where('tenant_id', $tenantId)
            ->where('guard_name', $this->getGuardName())
            ->whereIn('id', $ids)
            ->with('permissions')
            ->get()
            ->keyBy('id');

        $existingNames = Role::query()
            ->where('tenant_id', $tenantId)
            ->where('guard_name', $this->getGuardName())
            ->pluck('name')
            ->all();

        $duplicated = [];

        foreach ($ids as $id) {
            $source = $found->get($id);

            if (! $source instanceof Role) {
                continue;
            }

            $name = DuplicateNaming::buildDuplicateName($source->name, $existingNames);
            $existingNames[] = $name;

            $copy = Role::query()->create([
                'name' => $name,
                'guard_name' => $this->getGuardName(),
                'tenant_id' => $tenantId,
                'is_system' => false,
                'role_template_id' => null,
                'created_by' => Auth::id(),
            ]);

            $copy->syncPermissions($source->permissions->pluck('name')->all());
            $duplicated[] = $copy;
        }

        if ($duplicated !== []) {
            $this->forgetPermissionCache();
        }

        return $duplicated;
    }

    private function setTeam(int|string $tenantId): void
    {
        app(PermissionRegistrar::class)->setPermissionsTeamId($tenantId);
    }

    private function forgetPermissionCache(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
