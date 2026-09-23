<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('permissions')) {
            return;
        }

        $dead = DB::table('permissions')
            ->where(function ($query): void {
                $query->where('name', 'like', 'Restore:%')
                    ->orWhere('name', 'like', 'RestoreAny:%')
                    ->orWhere('name', 'like', 'ForceDelete:%')
                    ->orWhere('name', 'like', 'ForceDeleteAny:%')
                    ->orWhere('name', 'like', 'Replicate:%')
                    ->orWhere('name', 'like', 'Reorder:%')
                    ->orWhere('name', 'like', 'DeleteAny:%');
            })
            ->pluck('id');

        if ($dead->isEmpty()) {
            return;
        }

        DB::table('role_has_permissions')->whereIn('permission_id', $dead)->delete();
        DB::table('model_has_permissions')->whereIn('permission_id', $dead)->delete();
        DB::table('permissions')->whereIn('id', $dead)->delete();
    }

    public function down(): void
    {
        // Destructive prune — not reversible.
    }
};
