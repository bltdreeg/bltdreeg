<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('branches', 'service_location_type')) {
            return;
        }

        // Keep the string column; store a JSON array so multiple locations can be selected.
        DB::table('branches')
            ->whereNotNull('service_location_type')
            ->orderBy('id')
            ->each(function (object $branch): void {
                $value = $branch->service_location_type;

                if ($value === null || $value === '') {
                    return;
                }

                $decoded = json_decode((string) $value, true);

                if (is_array($decoded)) {
                    return;
                }

                DB::table('branches')->where('id', $branch->id)->update([
                    'service_location_type' => json_encode([(string) $value]),
                ]);
            });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('branches', 'service_location_type')) {
            return;
        }

        DB::table('branches')
            ->whereNotNull('service_location_type')
            ->orderBy('id')
            ->each(function (object $branch): void {
                $decoded = json_decode((string) $branch->service_location_type, true);

                if (! is_array($decoded) || $decoded === []) {
                    return;
                }

                DB::table('branches')->where('id', $branch->id)->update([
                    'service_location_type' => (string) $decoded[0],
                ]);
            });
    }
};
