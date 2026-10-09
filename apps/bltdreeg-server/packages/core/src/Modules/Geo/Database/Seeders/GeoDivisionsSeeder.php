<?php

namespace Bltdreeg\Core\Modules\Geo\Database\Seeders;

use Bltdreeg\Core\Modules\Geo\Support\GeoImporter;
use Illuminate\Database\Seeder;

class GeoDivisionsSeeder extends Seeder
{
    public function run(GeoImporter $importer): void
    {
        $importer->import(config('geo.full_snapshot_path'));
    }
}
