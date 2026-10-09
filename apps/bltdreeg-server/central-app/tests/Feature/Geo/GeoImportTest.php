<?php

use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Bltdreeg\Core\Modules\Geo\Support\GeoImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('migration imports the testing fixture', function () {
    expect(GeoGovernorate::query()->count())->toBe(27)
        ->and(GeoCity::query()->whereIn('governorate_id', ['EG01', 'EG02'])->count())->toBe(GeoCity::query()->count())
        ->and(GeoCity::query()->find('EG0111'))->not->toBeNull();

    $city = GeoCity::query()->findOrFail('EG0111');
    expect($city->governorate_id)->toBe('EG01')
        ->and($city->getTranslation('name', 'en'))->toBe('Qasr Al-Nile')
        ->and($city->lat)->toBe(30.043);
});

test('full snapshot import is complete and idempotent', function () {
    $importer = app(GeoImporter::class);

    $first = $importer->import(config('geo.full_snapshot_path'));
    $second = $importer->import(config('geo.full_snapshot_path'));

    expect($first)->toBe(['governorates' => 27, 'cities' => 365])
        ->and($second)->toBe($first)
        ->and(GeoCity::query()->count())->toBe(365);
});

test('validate rejects a payload whose stats do not match', function () {
    $json = json_decode(file_get_contents(config('geo.full_snapshot_path')), true);
    $json['meta']['stats']['district'] = 1;

    app(GeoImporter::class)->validate($json);
})->throws(InvalidArgumentException::class);
