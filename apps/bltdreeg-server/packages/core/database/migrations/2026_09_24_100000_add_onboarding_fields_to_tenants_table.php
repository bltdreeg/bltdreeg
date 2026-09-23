<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $addedStatus = ! Schema::hasColumn('tenants', 'status');

        Schema::table('tenants', function (Blueprint $table): void {
            if (! Schema::hasColumn('tenants', 'status')) {
                $table->string('status')->default('draft')->after('is_active')->index();
            }

            if (! Schema::hasColumn('tenants', 'website')) {
                $table->string('website')->nullable()->after('email');
            }

            if (! Schema::hasColumn('tenants', 'onboarding_completed_at')) {
                $table->timestamp('onboarding_completed_at')->nullable()->after('status');
            }

            if (! Schema::hasColumn('tenants', 'terms_accepted_at')) {
                $table->timestamp('terms_accepted_at')->nullable()->after('onboarding_completed_at');
            }

            if (! Schema::hasColumn('tenants', 'privacy_accepted_at')) {
                $table->timestamp('privacy_accepted_at')->nullable()->after('terms_accepted_at');
            }

            if (! Schema::hasColumn('tenants', 'terms_version')) {
                $table->string('terms_version')->nullable()->after('privacy_accepted_at');
            }
        });

        // Salons that existed before self-registration were created by admins and are already live.
        if ($addedStatus) {
            DB::table('tenants')->update([
                'status' => 'approved',
                'onboarding_completed_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            if (Schema::hasColumn('tenants', 'status')) {
                $table->dropIndex(['status']);
            }

            $columns = array_values(array_filter([
                Schema::hasColumn('tenants', 'status') ? 'status' : null,
                Schema::hasColumn('tenants', 'website') ? 'website' : null,
                Schema::hasColumn('tenants', 'onboarding_completed_at') ? 'onboarding_completed_at' : null,
                Schema::hasColumn('tenants', 'terms_accepted_at') ? 'terms_accepted_at' : null,
                Schema::hasColumn('tenants', 'privacy_accepted_at') ? 'privacy_accepted_at' : null,
                Schema::hasColumn('tenants', 'terms_version') ? 'terms_version' : null,
            ]));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
