<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Upserts OpenAdminData's Egypt payload (governorate → district → shiyakha) into geo_* tables.
 * Cities with no areas get a placeholder area "<cityId>00" so every city has at least one area.
 */
class GeoImporter
{
    private const CHUNK = 500;

    /**
     * @return array{governorates: int, cities: int, areas: int}
     */
    public function import(string $path): array
    {
        $json = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);

        $this->validate($json);

        $governorates = array_map(fn (array $row): array => $this->row($row), $json['data']['governorate']);

        $cityGovernorate = [];
        $cities = array_map(function (array $row) use (&$cityGovernorate): array {
            $cityGovernorate[$row['id']] = $row['parent_id'];

            return [...$this->row($row), 'governorate_id' => $row['parent_id']];
        }, $json['data']['district']);

        $areas = array_map(fn (array $row): array => [
            ...$this->row($row),
            'city_id' => $row['parent_id'],
            'governorate_id' => $cityGovernorate[$row['parent_id']],
            'is_placeholder' => false,
        ], $json['data']['shiyakha']);

        $citiesWithAreas = array_flip(array_column($json['data']['shiyakha'], 'parent_id'));

        foreach ($json['data']['district'] as $city) {
            if (! isset($citiesWithAreas[$city['id']])) {
                $areas[] = [
                    ...$this->row($city),
                    'id' => $city['id'].'00',
                    'city_id' => $city['id'],
                    'governorate_id' => $city['parent_id'],
                    'is_placeholder' => true,
                ];
            }
        }

        DB::transaction(function () use ($governorates, $cities, $areas): void {
            foreach (array_chunk($governorates, self::CHUNK) as $chunk) {
                DB::table('geo_governorates')->upsert($chunk, ['id'], ['name', 'lat', 'lng']);
            }

            foreach (array_chunk($cities, self::CHUNK) as $chunk) {
                DB::table('geo_cities')->upsert($chunk, ['id'], ['governorate_id', 'name', 'lat', 'lng']);
            }

            foreach (array_chunk($areas, self::CHUNK) as $chunk) {
                DB::table('geo_areas')->upsert($chunk, ['id'], ['city_id', 'governorate_id', 'name', 'lat', 'lng', 'is_placeholder']);
            }
        });

        return [
            'governorates' => DB::table('geo_governorates')->count(),
            'cities' => DB::table('geo_cities')->count(),
            'areas' => DB::table('geo_areas')->count(),
        ];
    }

    /**
     * @param  array<string, mixed>  $json
     */
    public function validate(array $json): void
    {
        foreach (['governorate', 'district', 'shiyakha'] as $level) {
            $rows = $json['data'][$level] ?? null;
            $expected = $json['meta']['stats'][$level] ?? null;

            if (! is_array($rows) || $expected !== count($rows)) {
                throw new InvalidArgumentException("Geo payload level [{$level}] is missing or does not match meta.stats.");
            }
        }
    }

    /**
     * A smaller payload holding every governorate but only the given governorates' cities and areas.
     *
     * @param  array<string, mixed>  $json
     * @param  list<string>  $governorateIds
     * @return array<string, mixed>
     */
    public function fixture(array $json, array $governorateIds): array
    {
        $cities = array_values(array_filter($json['data']['district'], fn (array $c): bool => in_array($c['parent_id'], $governorateIds, true)));
        $cityIds = array_flip(array_column($cities, 'id'));
        $areas = array_values(array_filter($json['data']['shiyakha'], fn (array $a): bool => isset($cityIds[$a['parent_id']])));

        $json['data']['district'] = $cities;
        $json['data']['shiyakha'] = $areas;
        $json['meta']['stats'] = ['governorate' => count($json['data']['governorate']), 'district' => count($cities), 'shiyakha' => count($areas)];

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
