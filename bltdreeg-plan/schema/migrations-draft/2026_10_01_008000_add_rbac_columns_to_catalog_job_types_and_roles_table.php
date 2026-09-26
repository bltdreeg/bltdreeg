<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 11: catalog job types carry the platform palette (salon admin,
 * cashier, reception, barber, custom). grants_login = false marks records-only
 * entries (barber has no credentials/permissions/login).
 * roles.is_catalog_preset / source_job_type_id link a salon role to the catalog
 * job-type preset it was imported from (copy-on-take, mirror role_templates).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalog_job_types', function (Blueprint $table): void {
            if (! Schema::hasColumn('catalog_job_types', 'grants_login')) {
                $table->boolean('grants_login')->default(true)->after('is_active');
            }
        });

        Schema::table('roles', function (Blueprint $table): void {
            if (! Schema::hasColumn('roles', 'is_catalog_preset')) {
                $table->boolean('is_catalog_preset')->default(false)->after('source_template_id');
            }

            if (! Schema::hasColumn('roles', 'source_job_type_id')) {
                $table->foreignId('source_job_type_id')->nullable()->after('is_catalog_preset')->constrained('catalog_job_types')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table): void {
            if (Schema::hasColumn('roles', 'source_job_type_id')) {
                $table->dropConstrainedForeignId('source_job_type_id');
            }

            if (Schema::hasColumn('roles', 'is_catalog_preset')) {
                $table->dropColumn('is_catalog_preset');
            }
        });

        Schema::table('catalog_job_types', function (Blueprint $table): void {
            if (Schema::hasColumn('catalog_job_types', 'grants_login')) {
                $table->dropColumn('grants_login');
            }
        });
    }
};