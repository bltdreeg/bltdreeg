<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Tenancy\Support;

use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;

final class TenantSlug
{
    public const MAX_LENGTH = 250;

    /**
     * Tenant slugs are the first URL segment of the tenant panel, so they must not
     * shadow the panel's own top-level routes.
     *
     * @var list<string>
     */
    public const RESERVED = [
        'admin',
        'api',
        'email-verification',
        'filament',
        'livewire',
        'login',
        'logout',
        'password-reset',
        'register',
        'storage',
        'up',
    ];

    /**
     * Turn a business name into a URL-safe slug that keeps Arabic and Latin letters.
     *
     * Examples: "Glow Studio" → glow-studio, "مركز المحله الكبرى" → مركز-المحله-الكبرى
     */
    public static function slugify(string $name): string
    {
        $slug = mb_strtolower(trim($name), 'UTF-8');

        // Spaces / underscores → hyphens
        $slug = preg_replace('/[\s_]+/u', '-', $slug) ?? '';

        // Keep letters (any language), numbers, and hyphens only.
        $slug = preg_replace('/[^\p{L}\p{N}\-]+/u', '', $slug) ?? '';

        // Collapse repeated hyphens and trim edges.
        $slug = preg_replace('/-+/u', '-', $slug) ?? '';
        $slug = trim($slug, '-');

        if ($slug === '') {
            $slug = 'salon';
        }

        if (mb_strlen($slug) > self::MAX_LENGTH) {
            $slug = rtrim(mb_substr($slug, 0, self::MAX_LENGTH), '-');
        }

        return $slug !== '' ? $slug : 'salon';
    }

    /** @deprecated Use slugify() */
    public static function normalize(string $slug): string
    {
        return self::slugify($slug);
    }

    public static function isAvailable(string $slug, ?int $ignoreTenantId = null): bool
    {
        $slug = self::slugify($slug);

        if ($slug === '' || in_array($slug, self::RESERVED, true)) {
            return false;
        }

        return ! Tenant::query()
            ->where('slug', $slug)
            ->when($ignoreTenantId, fn ($query) => $query->whereKeyNot($ignoreTenantId))
            ->exists();
    }

    /**
     * Build a unique panel slug from a salon name. Collisions get a numeric suffix.
     */
    public static function generate(string $name): string
    {
        $base = self::slugify($name);

        if (in_array($base, self::RESERVED, true)) {
            $base = $base.'-salon';
        }

        $slug = $base;
        $suffix = 2;

        while (! self::isAvailable($slug)) {
            $suffixText = '-'.$suffix;
            $slug = self::slugify(mb_substr($base, 0, self::MAX_LENGTH - mb_strlen($suffixText)).$suffixText);
            $suffix++;
        }

        return $slug;
    }
}
