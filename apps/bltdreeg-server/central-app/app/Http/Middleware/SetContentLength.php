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
        file_put_contents(storage_path('logs/probe.log'), json_encode(['m' => $event->request->method(), 'p' => $event->request->path(), 'host' => $event->request->getHost(), 'hdr' => array_intersect_key($event->request->headers->all(), array_flip(['host', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port', 'x-original-host', 'origin', 'forwarded'])), 'loc' => $response->headers->get('Location')])."\n", FILE_APPEND);

        if ($response instanceof StreamedResponse || $response instanceof BinaryFileResponse) {
            return;
        }

        $content = $response->getContent();

        if (is_string($content)) {
            $response->headers->set('Content-Length', (string) strlen($content));
        }
    }
}
