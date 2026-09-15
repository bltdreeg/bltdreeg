<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function (): void {
            // Filament still needs these named routes even when
            // LARAVEL_CRM_USER_INTERFACE=false (package skips loading them).
            // Keep them outside `web` so embeds/pixels skip session/CSRF.
            Route::group(['domain' => null, 'prefix' => null, 'middleware' => []], function (): void {
                require base_path('vendor/venturedrake/laravel-crm/src/Http/email-tracking-routes.php');
                require base_path('vendor/venturedrake/laravel-crm/src/Http/chat-embed-routes.php');
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
