<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Onboarding\Support;

final class LegalTerms
{
    /**
     * Bump whenever the published Terms of Service or Privacy Policy text changes,
     * so salons that accepted an older version can be asked to re-accept.
     */
    public const VERSION = '2026-09-22';

    public static function marketingBaseUrl(): string
    {
        return rtrim((string) config('services.marketing.url', 'http://localhost:3213'), '/');
    }

    public static function homeUrl(): string
    {
        // Customer web is Arabic-only and mounts under /ar.
        return self::marketingBaseUrl().'/ar';
    }

    public static function termsUrl(): string
    {
        return self::marketingBaseUrl().'/ar/terms';
    }

    public static function privacyUrl(): string
    {
        return self::marketingBaseUrl().'/ar/privacy';
    }
}
