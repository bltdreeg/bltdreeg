<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Data\Coordinates;

final class GoogleMapsUrlParser
{
    private const NUMBER = '(-?\d{1,3}(?:\.\d+)?)';

    /** google.com, google.com.eg, google.co.uk … (the host must end right after the TLD part). */
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
