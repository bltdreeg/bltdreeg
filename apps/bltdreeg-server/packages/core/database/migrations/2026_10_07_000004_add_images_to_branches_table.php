<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            if (! Schema::hasColumn('branches', 'images')) {
                $table->json('images')->nullable()->after('maps_url');
            }

            if (! Schema::hasColumn('branches', 'cover_image')) {
                $table->string('cover_image', 500)->nullable()->after('images');
            }
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            foreach (['cover_image', 'images'] as $column) {
                if (Schema::hasColumn('branches', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
