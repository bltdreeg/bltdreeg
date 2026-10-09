<?php

namespace Bltdreeg\Core\Modules\Geo\Support;

use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
            if (! $this->isSafeRequestUrl($url)) {
                return null;
            }

            try {
                $response = Http::withoutRedirecting()
                    ->timeout(self::TIMEOUT_SECONDS)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; Bltdreeg/1.0)'])
                    ->get($url);
            } catch (Throwable $e) {
                Log::warning('geo.maps_link_expand_failed', ['url' => $url, 'error' => $e->getMessage()]);

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

            $url = $next;
        }

        return null;
    }

    /**
     * Only plain https on the default port, and only to Google's own hosts, is ever requested.
     */
    private function isSafeRequestUrl(string $url): bool
    {
        $parts = parse_url($url);

        if (! is_array($parts) || strtolower($parts['scheme'] ?? '') !== 'https' || ($parts['port'] ?? 443) !== 443) {
            return false;
        }

        $host = strtolower($parts['host'] ?? '');

        return GoogleMapsUrlParser::isGoogleHost($host) || in_array($host, GoogleMapsUrlParser::shortHosts(), true);
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
