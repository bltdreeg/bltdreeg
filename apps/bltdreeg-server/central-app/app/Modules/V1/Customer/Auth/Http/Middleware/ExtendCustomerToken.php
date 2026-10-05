<?php

namespace App\Modules\V1\Customer\Auth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExtendCustomerToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $customer = $request->user('customer');
        if ($customer && method_exists($customer, 'currentAccessToken')) {
            $token = $customer->currentAccessToken();

            if ($token && $token->expires_at) {
                // If fewer than 60 days remain, extend by 90 days
                if (now()->diffInDays($token->expires_at, false) < 60) {
                    $ttlDays = (int) config('customer_auth.token_ttl_days', 90);
                    $token->forceFill([
                        'expires_at' => now()->addDays($ttlDays),
                    ])->save();
                }
            }
        }

        return $response;
    }
}
