<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Services move from tenant-owned to branch-owned (spec §4.1). Existing rows attach to
 * the tenant's lowest-id branch and are duplicated into every other branch of that
 * tenant, so no branch starts empty and no row is lost. `service_categories` stay
 * tenant-level — a category is grouping only.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            $table->foreignId('branch_id')->nullable()->after('tenant_id')
                ->constrained('branches')->cascadeOnDelete();
        });

        $this->backfill();

        Schema::table('services', function (Blueprint $table): void {
            $table->foreignId('branch_id')->nullable(false)->change();
            $table->index(['branch_id', 'is_active']);
        });
    }

    private function backfill(): void
    {
        $branchesByTenant = DB::table('branches')
            ->orderBy('id')
            ->get(['id', 'tenant_id'])
            ->groupBy('tenant_id');

        foreach ($branchesByTenant as $tenantId => $branches) {
            $ids = $branches->pluck('id')->all();
            $primary = array_shift($ids);

            DB::table('services')
                ->where('tenant_id', $tenantId)
                ->whereNull('branch_id')
                ->update(['branch_id' => $primary]);

            if ($ids === []) {
                continue;
            }

            $originals = DB::table('services')
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $primary)
                ->get();

            foreach ($ids as $branchId) {
                $rows = $originals->map(function (object $row) use ($branchId): array {
                    $copy = (array) $row;
                    unset($copy['id']);
                    $copy['branch_id'] = $branchId;

                    return $copy;
                })->all();

                if ($rows !== []) {
                    DB::table('services')->insert($rows);
                }
            }
        }

        // A tenant with no branches at all cannot hold branch-owned services.
        DB::table('services')->whereNull('branch_id')->delete();
    }

    public function down(): void
    {
        // Keep only the rows this migration treated as originals: those in each
        // tenant's lowest-id branch. Identity is never compared by the translatable
        // `name` JSON.
        $primaryIds = DB::table('branches')
            ->select('tenant_id', DB::raw('MIN(id) as id'))
            ->groupBy('tenant_id')
            ->pluck('id')
            ->all();

        if ($primaryIds !== []) {
            DB::table('services')->whereNotIn('branch_id', $primaryIds)->delete();
        }

        Schema::table('services', function (Blueprint $table): void {
            $table->dropIndex(['branch_id', 'is_active']);
            $table->dropConstrainedForeignId('branch_id');
        });
    }
};
