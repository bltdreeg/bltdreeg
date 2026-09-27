<?php

declare(strict_types=1);

namespace App\Modules\V1\Shared\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets locale for every /api/* request from Accept-Language (ar|en, default ar).
 */
class SetApiLocale
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/*')) {
            app()->setLocale($request->getPreferredLanguage(['ar', 'en']) ?? 'ar');
        }

        return $next($request);
    }
}
