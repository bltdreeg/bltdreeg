<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            if (! Schema::hasColumn('branches', 'team_size')) {
                $table->string('team_size')->nullable()->after('longitude');
            }

            if (! Schema::hasColumn('branches', 'service_location_type')) {
                $table->string('service_location_type')->nullable()->after('team_size');
            }
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $columns = array_values(array_filter([
                Schema::hasColumn('branches', 'team_size') ? 'team_size' : null,
                Schema::hasColumn('branches', 'service_location_type') ? 'service_location_type' : null,
            ]));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
