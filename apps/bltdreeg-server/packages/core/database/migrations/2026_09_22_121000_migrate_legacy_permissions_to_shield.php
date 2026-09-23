<?php

use Bltdreeg\Core\Modules\Auth\Support\ShieldPermissions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('permissions') || ! Schema::hasTable('role_has_permissions')) {
            return;
        }

        $permissionClass = config('permission.models.permission');
        $guard = config('auth.defaults.guard', 'web');

        foreach (ShieldPermissions::names() as $name) {
            $permissionClass::query()->firstOrCreate([
                'name' => $name,
                'guard_name' => $guard,
            ]);
        }

        $legacyIds = $permissionClass::query()
            ->whereIn('name', array_keys(ShieldPermissions::LEGACY_MAP))
            ->pluck('id', 'name');

        $shieldIds = $permissionClass::query()
            ->whereIn('name', array_values(ShieldPermissions::LEGACY_MAP))
            ->pluck('id', 'name');

        foreach (ShieldPermissions::LEGACY_MAP as $legacyName => $shieldName) {
            $legacyId = $legacyIds[$legacyName] ?? null;
            $shieldId = $shieldIds[$shieldName] ?? null;

            if ($legacyId === null || $shieldId === null) {
                continue;
            }

            $roleIds = DB::table('role_has_permissions')
                ->where('permission_id', $legacyId)
                ->pluck('role_id');

            foreach ($roleIds as $roleId) {
                DB::table('role_has_permissions')->insertOrIgnore([
                    'permission_id' => $shieldId,
                    'role_id' => $roleId,
                ]);
            }

            DB::table('role_has_permissions')->where('permission_id', $legacyId)->delete();

            if (Schema::hasTable('model_has_permissions')) {
                $assignments = DB::table('model_has_permissions')
                    ->where('permission_id', $legacyId)
                    ->get();

                foreach ($assignments as $assignment) {
                    $payload = (array) $assignment;
                    $payload['permission_id'] = $shieldId;

                    DB::table('model_has_permissions')->insertOrIgnore($payload);
                }

                DB::table('model_has_permissions')->where('permission_id', $legacyId)->delete();
            }

            $permissionClass::query()->whereKey($legacyId)->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Irreversible data migration.
    }
};
