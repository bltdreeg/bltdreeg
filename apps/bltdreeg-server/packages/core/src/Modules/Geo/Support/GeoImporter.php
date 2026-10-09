<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Upserts OpenAdminData's Egypt payload (governorate → district) into geo_* tables.
 */
class GeoImporter
{
    private const CHUNK = 500;

    /**
     * @return array{governorates: int, cities: int}
     */
    public function import(string $path): array
    {
        $json = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);

        $this->validate($json);

        $governorates = array_map(fn (array $row): array => $this->row($row), $json['data']['governorate']);

        $cities = array_map(fn (array $row): array => [
            ...$this->row($row),
            'governorate_id' => $row['parent_id'],
        ], $json['data']['district']);

        DB::transaction(function () use ($governorates, $cities): void {
            foreach (array_chunk($governorates, self::CHUNK) as $chunk) {
                DB::table('geo_governorates')->upsert($chunk, ['id'], ['name', 'lat', 'lng']);
            }

            foreach (array_chunk($cities, self::CHUNK) as $chunk) {
                DB::table('geo_cities')->upsert($chunk, ['id'], ['governorate_id', 'name', 'lat', 'lng']);
            }
        });

        return [
            'governorates' => DB::table('geo_governorates')->count(),
            'cities' => DB::table('geo_cities')->count(),
        ];
    }

    /**
     * @param  array<string, mixed>  $json
     */
    public function validate(array $json): void
    {
        foreach (['governorate', 'district'] as $level) {
            $rows = $json['data'][$level] ?? null;
            $expected = $json['meta']['stats'][$level] ?? null;

            if (! is_array($rows) || $expected !== count($rows)) {
                throw new InvalidArgumentException("Geo payload level [{$level}] is missing or does not match meta.stats.");
            }
        }
    }

    /**
     * A smaller payload holding every governorate but only the given governorates' cities.
     *
     * @param  array<string, mixed>  $json
     * @param  list<string>  $governorateIds
     * @return array<string, mixed>
     */
    public function fixture(array $json, array $governorateIds): array
    {
        $cities = array_values(array_filter($json['data']['district'], fn (array $c): bool => in_array($c['parent_id'], $governorateIds, true)));

        $json['data']['district'] = $cities;
        $json['meta']['stats'] = ['governorate' => count($json['data']['governorate']), 'district' => count($cities)];

        return $json;
    }

    /**
     * @param  array<string, mixed>  $source
     * @return array{id: string, name: string, lat: float, lng: float}
     */
    private function row(array $source): array
    {
        return [
            'id' => $source['id'],
            'name' => json_encode(['ar' => $source['name_local'], 'en' => $source['name_en']], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            'lat' => (float) $source['lat'],
            'lng' => (float) $source['lon'],
        ];
    }
}
