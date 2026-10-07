<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('branches', 'maps_url')) {
            return;
        }

        Schema::table('branches', function (Blueprint $table): void {
            $table->string('maps_url', 500)->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('branches', 'maps_url')) {
            return;
        }

        Schema::table('branches', function (Blueprint $table): void {
            $table->dropColumn('maps_url');
        });
    }
};
