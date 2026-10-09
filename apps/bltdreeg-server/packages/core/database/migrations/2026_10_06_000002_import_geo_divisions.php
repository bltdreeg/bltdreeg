<?php

use Bltdreeg\Core\Modules\Geo\Support\GeoImporter;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// بيانات مرجعية لازمة قبل ما العملاء والفروع يبقوا NOT NULL — الإنتاج مبيشغلش seeders
return new class extends Migration
{
    public function up(): void
    {
        app(GeoImporter::class)->import(config('geo.snapshot_path'));
    }

    public function down(): void
    {
        DB::table('geo_cities')->delete();
        DB::table('geo_governorates')->delete();
    }
};
