<?php

use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Bltdreeg\Core\Modules\Geo\Support\GeoImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('migration imports the testing fixture', function () {
    expect(GeoGovernorate::query()->count())->toBe(27)
        ->and(GeoCity::query()->whereIn('governorate_id', ['EG01', 'EG02'])->count())->toBe(GeoCity::query()->count())
        ->and(GeoArea::query()->find('EG011103'))->not->toBeNull();

    $area = GeoArea::query()->findOrFail('EG011103');
    expect($area->city_id)->toBe('EG0111')
        ->and($area->governorate_id)->toBe('EG01')
        ->and($area->getTranslation('name', 'en'))->toBe('Qasr El-Doubara')
        ->and($area->lat)->toBe(30.042);
});

test('cities without areas get one placeholder area', function () {
    $placeholder = GeoArea::query()->findOrFail('EG010000');

    expect($placeholder->is_placeholder)->toBeTrue()
        ->and($placeholder->city_id)->toBe('EG0100')
        ->and($placeholder->getTranslation('name', 'ar'))->toBe(GeoCity::query()->findOrFail('EG0100')->getTranslation('name', 'ar'));

    GeoCity::query()->each(fn (GeoCity $city) => expect($city->areas()->count())->toBeGreaterThan(0));
});

test('full snapshot import is complete and idempotent', function () {
    $importer = app(GeoImporter::class);

    $first = $importer->import(config('geo.full_snapshot_path'));
    $second = $importer->import(config('geo.full_snapshot_path'));

    expect($first)->toBe(['governorates' => 27, 'cities' => 365, 'areas' => 5730])
        ->and($second)->toBe($first)
        ->and(GeoArea::query()->count())->toBe(5730)
        ->and(GeoArea::query()->where('is_placeholder', true)->count())->toBe(14);
});

test('validate rejects a payload whose stats do not match', function () {
    $json = json_decode(file_get_contents(config('geo.full_snapshot_path')), true);
    $json['meta']['stats']['shiyakha'] = 1;

    app(GeoImporter::class)->validate($json);
})->throws(InvalidArgumentException::class);
