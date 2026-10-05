<?php

use Bltdreeg\Core\Modules\Geo\Support\GoogleMapsLinkResolver;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(fn () => Http::preventStrayRequests());

test('long links resolve without any request', function () {
    Http::fake();

    $coordinates = app(GoogleMapsLinkResolver::class)->resolve('https://www.google.com/maps/@30.0444,31.2357,15z');

    expect($coordinates?->lat)->toBe(30.0444);
    Http::assertNothingSent();
});

test('short links follow redirects to google', function () {
    Http::fake([
        'maps.app.goo.gl/*' => Http::response('', 302, ['Location' => 'https://www.google.com/maps/place/X/data=!3d31.2001!4d29.9187']),
    ]);

    $coordinates = app(GoogleMapsLinkResolver::class)->resolve('https://maps.app.goo.gl/AbC123');

    expect($coordinates?->lat)->toBe(31.2001)
        ->and($coordinates?->lng)->toBe(29.9187);
});

test('consent interstitial is unwrapped via continue param', function () {
    $target = urlencode('https://www.google.com/maps/@30.0444,31.2357,15z');
    Http::fake([
        'maps.app.goo.gl/*' => Http::response('', 302, ['Location' => "https://consent.google.com/m?continue={$target}"]),
    ]);

    expect(app(GoogleMapsLinkResolver::class)->resolve('https://maps.app.goo.gl/AbC123')?->lng)->toBe(31.2357);
});

test('refuses redirect to non-google host', function () {
    Http::fake([
        'maps.app.goo.gl/*' => Http::response('', 302, ['Location' => 'https://evil.example.com/@30.0444,31.2357,15z']),
        'evil.example.com/*' => Http::response('', 200),
    ]);

    expect(app(GoogleMapsLinkResolver::class)->resolve('https://maps.app.goo.gl/AbC123'))->toBeNull();
    Http::assertNotSent(fn (Request $request): bool => str_contains($request->url(), 'evil.example.com'));
});

test('stops after five hops', function () {
    Http::fake([
        'maps.app.goo.gl/*' => Http::response('', 302, ['Location' => 'https://maps.app.goo.gl/again']),
    ]);

    expect(app(GoogleMapsLinkResolver::class)->resolve('https://maps.app.goo.gl/start'))->toBeNull();
    Http::assertSentCount(5);
});

test('timeouts and points outside egypt return null', function () {
    Http::fake(['maps.app.goo.gl/*' => fn () => throw new ConnectionException('timeout')]);

    $resolver = app(GoogleMapsLinkResolver::class);

    expect($resolver->resolve('https://maps.app.goo.gl/AbC123'))->toBeNull()
        ->and($resolver->resolve('https://www.google.com/maps/@51.5074,-0.1278,15z'))->toBeNull()
        ->and($resolver->resolve('https://evil.example.com/x'))->toBeNull();
});
