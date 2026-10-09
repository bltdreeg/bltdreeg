<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('tenants', 'social_links')) {
            return;
        }

        Schema::table('tenants', function (Blueprint $table): void {
            $table->json('social_links')->nullable()->after('website');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('tenants', 'social_links')) {
            return;
        }

        Schema::table('tenants', function (Blueprint $table): void {
            $table->dropColumn('social_links');
        });
    }
};
