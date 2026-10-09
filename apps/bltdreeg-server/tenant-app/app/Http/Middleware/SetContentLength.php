<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Events\RequestHandled;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * `php artisan serve` ends responses by closing the connection. Dev tunnels re-chunk those responses and never
 * send the final chunk, so the browser waits until its own timeout. An explicit Content-Length avoids that.
 *
 * Runs as a RequestHandled listener, not middleware: Livewire injects its scripts on that event, after middleware,
 * so a length set earlier would truncate the page mid-tag.
 */
class SetContentLength
{
    public function handle(RequestHandled $event): void
    {
        $response = $event->response;

        if ($response instanceof StreamedResponse || $response instanceof BinaryFileResponse) {
            return;
        }

        $content = $response->getContent();

        if (is_string($content)) {
            $response->headers->set('Content-Length', (string) strlen($content));
        }
    }
}
