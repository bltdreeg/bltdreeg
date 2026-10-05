<?php

namespace App\Modules\V1\Customer\Auth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetApiLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $acceptLanguage = (string) $request->header('Accept-Language', 'ar');
        $locale = str_starts_with(strtolower($acceptLanguage), 'en') ? 'en' : 'ar';

        app()->setLocale($locale);

        return $next($request);
    }
}
