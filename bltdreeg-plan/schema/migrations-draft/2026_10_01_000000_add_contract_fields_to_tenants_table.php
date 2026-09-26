<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 7 (revenue model): contract terms the platform agrees with the salon.
 * contract_discount_pct is agreed per salon (e.g. 20.00).
 * The split is platform-owned and snapshotted onto each reservation at booking.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            if (! Schema::hasColumn('tenants', 'contract_discount_pct')) {
                $table->decimal('contract_discount_pct', 5, 2)->default(0)->after('is_active');
            }

            if (! Schema::hasColumn('tenants', 'platform_split_customer_pct')) {
                $table->smallInteger('platform_split_customer_pct')->nullable()->after('contract_discount_pct');
            }

            if (! Schema::hasColumn('tenants', 'platform_split_platform_pct')) {
                $table->smallInteger('platform_split_platform_pct')->nullable()->after('platform_split_customer_pct');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            $columns = array_values(array_filter([
                Schema::hasColumn('tenants', 'contract_discount_pct') ? 'contract_discount_pct' : null,
                Schema::hasColumn('tenants', 'platform_split_customer_pct') ? 'platform_split_customer_pct' : null,
                Schema::hasColumn('tenants', 'platform_split_platform_pct') ? 'platform_split_platform_pct' : null,
            ]));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};