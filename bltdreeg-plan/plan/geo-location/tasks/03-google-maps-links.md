# 03 · Google Maps link parser + short-link resolver

**Depends on:** 02 · **Decisions:** D15 · **Review Focus:** #3

Root: `apps/bltdreeg-server/`.

**Files:**
- Create: `packages/core/src/Modules/Geo/Support/GoogleMapsUrlParser.php` (pure, no network)
- Create: `packages/core/src/Modules/Geo/Support/GoogleMapsLinkResolver.php` (follows short links, then parses)
- Test: `central-app/tests/Unit/Geo/GoogleMapsUrlParserTest.php`, `central-app/tests/Feature/Geo/GoogleMapsLinkResolverTest.php`

**Interfaces:**
- Consumes: `Coordinates`, `EgyptBounds` (Task 02)
- Produces:
  - `GoogleMapsUrlParser::parse(string $url): ?Coordinates` (no bounds check)
  - `GoogleMapsUrlParser::isGoogleHost(string $host): bool`
  - `GoogleMapsUrlParser::isShortLink(string $url): bool`
  - `GoogleMapsLinkResolver::resolve(string $input): ?Coordinates`. It returns null unless the coordinates are found **and** inside Egypt.

---

- [ ] **Step 1: Write the failing parser test**

`central-app/tests/Unit/Geo/GoogleMapsUrlParserTest.php`:
```php
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
```

- [ ] **Step 2: Run it to verify it fails**

Run (in `central-app`): `php artisan test --compact tests/Unit/Geo/GoogleMapsUrlParserTest.php`
Expected: FAIL. The class `GoogleMapsUrlParser` is not found.

- [ ] **Step 3: Implement the parser**

`packages/core/src/Modules/Geo/Support/GoogleMapsUrlParser.php`:
```php
<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Data\Coordinates;

final class GoogleMapsUrlParser
{
    private const NUMBER = '(-?\d{1,3}(?:\.\d+)?)';

    /** google.com, google.com.eg, google.co.uk … (no other suffix allowed after the TLD part). */
    private const GOOGLE_HOST = '/^(?:[a-z0-9-]+\.)*google\.(?:com|co)(?:\.[a-z]{2})?$|^(?:[a-z0-9-]+\.)*google\.[a-z]{2}$/';

    private const SHORT_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'g.co'];

    public static function parse(string $url): ?Coordinates
    {
        $url = trim(urldecode($url));

        if (preg_match('/^geo:'.self::NUMBER.',\s*'.self::NUMBER.'/i', $url, $m) === 1) {
            return self::coordinates($m[1], $m[2]);
        }

        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        if ($host === '' || ! self::isGoogleHost($host)) {
            return null;
        }

        // !3d<lat>!4d<lng> هو دبوس المكان نفسه؛ @lat,lng ده مركز الشاشة بس
        $patterns = [
            '/!3d'.self::NUMBER.'!4d'.self::NUMBER.'/',
            '/[?&](?:q|query|ll|center|destination|daddr)='.self::NUMBER.',\s*'.self::NUMBER.'/',
            '/\/place\/'.self::NUMBER.',\s*'.self::NUMBER.'/',
            '/@'.self::NUMBER.','.self::NUMBER.'/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $m) === 1) {
                return self::coordinates($m[1], $m[2]);
            }
        }

        return null;
    }

    public static function isGoogleHost(string $host): bool
    {
        return preg_match(self::GOOGLE_HOST, strtolower($host)) === 1;
    }

    public static function isShortLink(string $url): bool
    {
        $host = strtolower((string) parse_url(trim($url), PHP_URL_HOST));
        $path = (string) parse_url(trim($url), PHP_URL_PATH);

        return match ($host) {
            'maps.app.goo.gl' => true,
            'goo.gl' => str_starts_with($path, '/maps'),
            'g.co' => str_starts_with($path, '/kgs'),
            default => false,
        };
    }

    /**
     * @return list<string>
     */
    public static function shortHosts(): array
    {
        return self::SHORT_HOSTS;
    }

    private static function coordinates(string $lat, string $lng): ?Coordinates
    {
        $lat = (float) $lat;
        $lng = (float) $lng;

        if (abs($lat) > 90 || abs($lng) > 180) {
            return null;
        }

        return new Coordinates($lat, $lng);
    }
}
```

- [ ] **Step 4: Run the parser test**

Run: `php artisan test --compact tests/Unit/Geo/GoogleMapsUrlParserTest.php`
Expected: PASS. If `lookalike host` matches, tighten `GOOGLE_HOST` until it fails. The host must *end* at `google.<tld>[.<cc>]`.

- [ ] **Step 5: Write the failing resolver test**

`central-app/tests/Feature/Geo/GoogleMapsLinkResolverTest.php`:
```php
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
```

- [ ] **Step 6: Run it to verify it fails**

Run: `php artisan test --compact tests/Feature/Geo/GoogleMapsLinkResolverTest.php`
Expected: FAIL. The class `GoogleMapsLinkResolver` is not found.

- [ ] **Step 7: Implement the resolver**

`packages/core/src/Modules/Geo/Support/GoogleMapsLinkResolver.php`:
```php
<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Pasted Google Maps link → coordinates in Egypt. Short links are followed server-side, but only
 * through Google hosts (no SSRF to arbitrary hosts), at most five hops, three seconds each.
 */
class GoogleMapsLinkResolver
{
    private const MAX_HOPS = 5;

    private const TIMEOUT_SECONDS = 3;

    public function resolve(string $input): ?Coordinates
    {
        $url = trim($input);

        if (GoogleMapsUrlParser::isShortLink($url)) {
            $url = $this->expand($url);
        }

        $coordinates = $url === null ? null : GoogleMapsUrlParser::parse($url);

        if ($coordinates === null || ! EgyptBounds::contains($coordinates->lat, $coordinates->lng)) {
            return null;
        }

        return $coordinates;
    }

    private function expand(string $url): ?string
    {
        for ($hop = 0; $hop < self::MAX_HOPS; $hop++) {
            try {
                $response = Http::withoutRedirecting()
                    ->timeout(self::TIMEOUT_SECONDS)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; Bltdreeg/1.0)'])
                    ->get($url);
            } catch (Throwable) {
                return null;
            }

            $location = $response->header('Location');

            if (! $response->redirect() || $location === '') {
                return GoogleMapsUrlParser::parse($url) !== null ? $url : null;
            }

            $next = $this->unwrapConsent($location);

            if (GoogleMapsUrlParser::parse($next) !== null) {
                return $next;
            }

            $host = strtolower((string) parse_url($next, PHP_URL_HOST));

            if (! GoogleMapsUrlParser::isGoogleHost($host) && ! in_array($host, GoogleMapsUrlParser::shortHosts(), true)) {
                return null;
            }

            $url = $next;
        }

        return null;
    }

    private function unwrapConsent(string $location): string
    {
        if (strtolower((string) parse_url($location, PHP_URL_HOST)) !== 'consent.google.com') {
            return $location;
        }

        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);

        return is_string($query['continue'] ?? null) ? $query['continue'] : $location;
    }
}
```
This design never sends a request to a non-Google host. A redirect is checked by parsing *before* deciding whether to follow it, and the host is checked before the next request. That keeps the `refuses redirect to non-google host` test green.

- [ ] **Step 8: Run both tests**

Run: `php artisan test --compact tests/Unit/Geo/GoogleMapsUrlParserTest.php tests/Feature/Geo/GoogleMapsLinkResolverTest.php`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add packages/core/src/Modules/Geo/Support central-app/tests/Unit/Geo central-app/tests/Feature/Geo
git commit -m "feat(geo): parse pasted google maps links and safely expand short links"
```
