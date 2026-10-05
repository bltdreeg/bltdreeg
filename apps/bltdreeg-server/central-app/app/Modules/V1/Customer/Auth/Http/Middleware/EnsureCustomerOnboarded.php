<?php

namespace App\Modules\V1\Customer\Auth\Http\Middleware;

use App\Modules\V1\Customer\Auth\Support\OnboardingStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerOnboarded
{
    public function handle(Request $request, Closure $next): Response
    {
        $customer = $request->user('customer');

        if ($customer) {
            $status = OnboardingStatus::for($customer);

            if (! $status['complete']) {
                return response()->json([
                    'message' => __('customer_auth.errors.auth.onboarding_required'),
                    'code' => 'auth.onboarding_required',
                    'data' => (object) [
                        'missing' => $status['missing'],
                    ],
                    'errors' => (object) [],
                ], 403);
            }
        }

        return $next($request);
    }
}
