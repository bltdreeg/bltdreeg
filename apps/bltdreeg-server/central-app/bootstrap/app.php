<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Behind a tunnel/proxy the socket peer is the proxy; trust X-Forwarded-For so $request->ip() is the real client (needed for IP geolocation).
        // Only local dev (tunnels) trusts every peer by default; elsewhere list proxy IPs/CIDRs in TRUSTED_PROXIES. Rate limits key on ip(), so a spoofable IP bypasses them.
        $trustedProxies = env('TRUSTED_PROXIES', env('APP_ENV') === 'local' ? '*' : '');

        $middleware->trustProxies(
            at: $trustedProxies === '*' ? '*' : array_filter(array_map('trim', explode(',', (string) $trustedProxies))),
            headers: Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => __('customer_auth.errors.auth.unauthenticated'),
                    'code' => 'auth.unauthenticated',
                    'data' => (object) [],
                    'errors' => (object) [],
                ], 401);
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => __('customer_auth.errors.validation.failed'),
                    'code' => 'validation.failed',
                    'data' => (object) [],
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*')) {
                $headers = $e->getHeaders();
                $retryAfter = (int) ($headers['Retry-After'] ?? 60);

                return response()->json([
                    'message' => __('customer_auth.errors.auth.too_many_requests'),
                    'code' => 'auth.too_many_requests',
                    'data' => [
                        'retryAfterSeconds' => $retryAfter,
                    ],
                    'errors' => (object) [],
                ], 429, $headers);
            }
        });
    })->create();
