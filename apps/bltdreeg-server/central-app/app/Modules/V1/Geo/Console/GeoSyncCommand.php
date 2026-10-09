<?php

namespace App\Modules\V1\Geo\Console;

use Bltdreeg\Core\Modules\Geo\Support\GeoImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class GeoSyncCommand extends Command
{
    protected $signature = 'geo:sync {--fixture : Only rebuild eg.testing.json from the committed snapshot}';

    protected $description = 'Download Egypt admin divisions, refresh the committed snapshot and upsert geo_* tables';

    public function handle(GeoImporter $importer): int
    {
        if ($this->option('fixture')) {
            $json = json_decode((string) file_get_contents(config('geo.full_snapshot_path')), true, flags: JSON_THROW_ON_ERROR);
            $this->writeJson(config('geo.testing_snapshot_path'), $importer->fixture($json, ['EG01', 'EG02']));
            $this->info('Wrote '.config('geo.testing_snapshot_path'));

            return self::SUCCESS;
        }

        $json = Http::timeout(60)->acceptJson()->get(config('geo.source_url'))->throw()->json();
        $importer->validate($json);

        $this->writeJson(config('geo.full_snapshot_path'), $json);
        $counts = $importer->import(config('geo.full_snapshot_path'));

        $this->table(['governorates', 'cities'], [$counts]);

        return self::SUCCESS;
    }

    /**
     * @param  array<string, mixed>  $json
     */
    private function writeJson(string $path, array $json): void
    {
        file_put_contents($path, json_encode($json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
    }
}
