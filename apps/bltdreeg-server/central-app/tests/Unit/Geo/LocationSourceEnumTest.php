<?php

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum as Source;

test('automatic updates respect the trust order', function (Source $current, Source $incoming, bool $replaces) {
    expect($current->canBeReplacedAutomaticallyBy($incoming))->toBe($replaces);
})->with([
    'ip refreshes ip' => [Source::Ip, Source::Ip, true],
    'ip replaces default' => [Source::Default, Source::Ip, true],
    'ip never replaces gps' => [Source::Gps, Source::Ip, false],
    'gps refreshes gps' => [Source::Gps, Source::Gps, true],
    'gps never replaces manual' => [Source::Manual, Source::Gps, false],
    'gps never replaces maps url' => [Source::MapsUrl, Source::Gps, false],
]);

test('labels round-trip', function () {
    foreach (Source::cases() as $case) {
        expect(Source::tryFromLabel($case->label()))->toBe($case);
    }

    expect(Source::tryFromLabel('nope'))->toBeNull()
        ->and(Source::tryFromLabel(null))->toBeNull();
});
