<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * `php artisan serve` ends responses by closing the connection. Dev tunnels re-chunk those responses and never
 * send the final chunk, so the browser waits until its own timeout. An explicit Content-Length avoids that.
 */
class SetContentLength
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response instanceof StreamedResponse || $response instanceof BinaryFileResponse || $response->headers->has('Content-Length')) {
            return $response;
        }

        $content = $response->getContent();

        if (is_string($content)) {
            $response->headers->set('Content-Length', (string) strlen($content));
        }

        return $response;
    }
}
