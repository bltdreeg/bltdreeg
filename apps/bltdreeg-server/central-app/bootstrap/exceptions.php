<?php

use App\Modules\V1\CustomerAuth\Exceptions\CustomerAuthException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return function (Exceptions $exceptions): void {
    $exceptions->shouldRenderJsonWhen(
        fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
    );

    $exceptions->render(function (CustomerAuthException $e, Request $request) {
        return $e->render($request);
    });

    $exceptions->render(function (ValidationException $e, Request $request) {
        if (! $request->is('api/*')) {
            return null;
        }

        return response()->json([
            'message' => __('api.validation.failed'),
            'code' => 'validation.failed',
            'data' => (object) [],
            'errors' => $e->errors(),
        ], $e->status);
    });

    $exceptions->render(function (AuthenticationException $e, Request $request) {
        if (! $request->is('api/*')) {
            return null;
        }

        return response()->json([
            'message' => __('api.auth.unauthenticated'),
            'code' => 'auth.unauthenticated',
            'data' => (object) [],
            'errors' => (object) [],
        ], 401);
    });

    $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
        if (! $request->is('api/*')) {
            return null;
        }

        $retryAfter = $e->getHeaders()['Retry-After'] ?? null;
        $retryAfterSeconds = is_numeric($retryAfter) ? (int) $retryAfter : null;

        return response()->json([
            'message' => __('api.auth.too_many_requests'),
            'code' => 'auth.too_many_requests',
            'data' => $retryAfterSeconds === null
                ? (object) []
                : ['retryAfterSeconds' => $retryAfterSeconds],
            'errors' => (object) [],
        ], 429)->withHeaders(
            $retryAfterSeconds === null ? [] : ['Retry-After' => (string) $retryAfterSeconds]
        );
    });

    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if (! $request->is('api/*')) {
            return null;
        }

        return response()->json([
            'message' => __('api.not_found'),
            'code' => 'not_found',
            'data' => (object) [],
            'errors' => (object) [],
        ], 404);
    });
};
