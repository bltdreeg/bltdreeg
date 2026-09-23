<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $roles = DB::table('roles')
            ->where('name', 'super_admin')
            ->whereNotNull('tenant_id')
            ->get();

        foreach ($roles as $role) {
            $ownerExists = DB::table('roles')
                ->where('tenant_id', $role->tenant_id)
                ->where('name', 'owner')
                ->where('guard_name', $role->guard_name)
                ->exists();

            if ($ownerExists) {
                // Move assignments from super_admin → existing owner, then drop duplicate.
                $ownerId = DB::table('roles')
                    ->where('tenant_id', $role->tenant_id)
                    ->where('name', 'owner')
                    ->where('guard_name', $role->guard_name)
                    ->value('id');

                DB::table('model_has_roles')
                    ->where('role_id', $role->id)
                    ->update(['role_id' => $ownerId]);

                DB::table('role_has_permissions')->where('role_id', $role->id)->delete();
                DB::table('roles')->where('id', $role->id)->delete();

                continue;
            }

            DB::table('roles')->where('id', $role->id)->update(['name' => 'owner']);
        }
    }

    public function down(): void
    {
        DB::table('roles')
            ->where('name', 'owner')
            ->whereNotNull('tenant_id')
            ->update(['name' => 'super_admin']);
    }
};
