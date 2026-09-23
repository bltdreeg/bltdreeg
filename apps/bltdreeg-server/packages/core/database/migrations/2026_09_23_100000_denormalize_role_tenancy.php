<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Turn Spatie teams off: pivots lose the team column; roles.tenant_id becomes a
 * plain required FK (not Spatie's team feature).
 */
return new class extends Migration
{
    public function up(): void
    {
        $teamKey = config('permission.column_names.team_foreign_key', 'tenant_id');

        $this->rebuildPivotWithoutTeam('model_has_roles', 'role_id', $teamKey);
        $this->rebuildPivotWithoutTeam('model_has_permissions', 'permission_id', $teamKey);

        if (! Schema::hasColumn('roles', 'tenant_id')) {
            Schema::table('roles', function (Blueprint $table): void {
                $table->foreignId('tenant_id')->after('id')->constrained('tenants')->cascadeOnDelete();
            });
        } else {
            DB::table('roles')->whereNull('tenant_id')->delete();
        }

        $this->ensureRolesUniqueIndex();
    }

    public function down(): void
    {
        // Irreversible without restoring Spatie teams structure.
    }

    private function rebuildPivotWithoutTeam(string $table, string $pivotKey, string $teamKey): void
    {
        if (! Schema::hasTable($table) || ! Schema::hasColumn($table, $teamKey)) {
            return;
        }

        $rows = DB::table($table)->get();

        Schema::drop($table);

        Schema::create($table, function (Blueprint $blueprint) use ($table, $pivotKey): void {
            $blueprint->unsignedBigInteger($pivotKey);
            $blueprint->string('model_type');
            $blueprint->unsignedBigInteger('model_id');
            $blueprint->index(['model_id', 'model_type'], $table.'_model_id_model_type_index');

            $related = $pivotKey === 'role_id' ? 'roles' : 'permissions';
            $blueprint->foreign($pivotKey)->references('id')->on($related)->cascadeOnDelete();
            $blueprint->primary(
                [$pivotKey, 'model_id', 'model_type'],
                $table.'_primary',
            );
        });

        $seen = [];
        foreach ($rows as $row) {
            $key = $row->{$pivotKey}.'|'.$row->model_id.'|'.$row->model_type;
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;

            DB::table($table)->insert([
                $pivotKey => $row->{$pivotKey},
                'model_id' => $row->model_id,
                'model_type' => $row->model_type,
            ]);
        }
    }

    private function ensureRolesUniqueIndex(): void
    {
        // Drop legacy uniques that conflict with tenant-scoped uniqueness.
        foreach (['roles_name_guard_name_unique', 'roles_tenant_id_name_guard_name_unique'] as $index) {
            try {
                Schema::table('roles', function (Blueprint $table) use ($index): void {
                    $table->dropUnique($index);
                });
            } catch (Throwable) {
                //
            }
        }

        try {
            Schema::table('roles', function (Blueprint $table): void {
                $table->dropUnique(['name', 'guard_name']);
            });
        } catch (Throwable) {
            //
        }

        try {
            Schema::table('roles', function (Blueprint $table): void {
                $table->unique(['tenant_id', 'name', 'guard_name']);
            });
        } catch (Throwable) {
            // Already present.
        }
    }
};
