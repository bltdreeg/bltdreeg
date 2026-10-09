<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('tenants', 'onboarding_draft')) {
            return;
        }

        Schema::table('tenants', function (Blueprint $table): void {
            $table->json('onboarding_draft')->nullable()->after('social_links');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('tenants', 'onboarding_draft')) {
            return;
        }

        Schema::table('tenants', function (Blueprint $table): void {
            $table->dropColumn('onboarding_draft');
        });
    }
};
