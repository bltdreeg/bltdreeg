<?php

use Bltdreeg\Core\Modules\Geo\Support\GoogleMapsUrlParser;

test('parses known google maps formats', function (string $url, float $lat, float $lng) {
    $coordinates = GoogleMapsUrlParser::parse($url);

    expect($coordinates)->not->toBeNull()
        ->and($coordinates->lat)->toBe($lat)
        ->and($coordinates->lng)->toBe($lng);
})->with([
    'place pin wins over viewport' => ['https://www.google.com/maps/place/Salon/@31.19,29.90,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d31.2001!4d29.9187', 31.2001, 29.9187],
    'viewport only' => ['https://www.google.com/maps/@30.0444,31.2357,15z', 30.0444, 31.2357],
    'q param' => ['https://maps.google.com/?q=30.0444,31.2357', 30.0444, 31.2357],
    'query param encoded' => ['https://www.google.com/maps/search/?api=1&query=30.0444%2C31.2357', 30.0444, 31.2357],
    'll param' => ['https://maps.google.com/maps?ll=30.0444,31.2357&z=16', 30.0444, 31.2357],
    'place path coords' => ['https://www.google.com.eg/maps/place/30.0444,31.2357', 30.0444, 31.2357],
    'dir destination' => ['https://www.google.com/maps/dir/?api=1&destination=31.2001,29.9187', 31.2001, 29.9187],
    'geo uri' => ['geo:30.0444,31.2357?z=17', 30.0444, 31.2357],
    'negative and spaces' => ['https://maps.google.com/?q=30.0444, 31.2357', 30.0444, 31.2357],
]);

test('returns null when there are no coordinates or the host is not google', function (string $url) {
    expect(GoogleMapsUrlParser::parse($url))->toBeNull();
})->with([
    'search by name' => ['https://www.google.com/maps/place/Cairo+Tower'],
    'not google' => ['https://evil.example.com/maps/@30.0444,31.2357,15z'],
    'lookalike host' => ['https://google.com.evil.io/maps/@30.0444,31.2357,15z'],
    'garbage' => ['not a url'],
    'out of range' => ['https://maps.google.com/?q=130.0,31.2'],
]);

test('detects short links and google hosts', function () {
    expect(GoogleMapsUrlParser::isShortLink('https://maps.app.goo.gl/AbC123'))->toBeTrue()
        ->and(GoogleMapsUrlParser::isShortLink('https://goo.gl/maps/AbC123'))->toBeTrue()
        ->and(GoogleMapsUrlParser::isShortLink('https://g.co/kgs/AbC123'))->toBeTrue()
        ->and(GoogleMapsUrlParser::isShortLink('https://www.google.com/maps/@30,31,15z'))->toBeFalse()
        ->and(GoogleMapsUrlParser::isGoogleHost('www.google.com.eg'))->toBeTrue()
        ->and(GoogleMapsUrlParser::isGoogleHost('google.com.evil.io'))->toBeFalse();
});
