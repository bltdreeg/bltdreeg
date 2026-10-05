<?php

return [
    'source_url' => 'https://api.openadmindata.org/api/v1/countries/eg.json',

    // الـ migration بتستورد من هنا؛ الاختبارات بتشاور على fixture صغير عن طريق GEO_SNAPSHOT_PATH
    'snapshot_path' => env('GEO_SNAPSHOT_PATH')
        ? base_path(env('GEO_SNAPSHOT_PATH'))
        : dirname(__DIR__).'/database/data/geo/eg.json',

    'full_snapshot_path' => dirname(__DIR__).'/database/data/geo/eg.json',
    'testing_snapshot_path' => dirname(__DIR__).'/database/data/geo/eg.testing.json',

    /** Qasr El-Doubara, Qasr Al-Nile, Cairo — used when GPS and IP both fail. */
    'default_area_id' => env('GEO_DEFAULT_AREA_ID', 'EG011103'),

    'maxmind_db_path' => env('GEOIP_DATABASE_PATH', dirname(__DIR__, 3).'/storage/geoip/GeoLite2-City.mmdb'),

    'map_tile_url' => env('MAP_TILE_URL', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
    'map_attribution' => env('MAP_ATTRIBUTION', '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'),
];
