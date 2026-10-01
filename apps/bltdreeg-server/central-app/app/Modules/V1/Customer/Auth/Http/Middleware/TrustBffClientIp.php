<?php

namespace App\Modules\V1\Customer\Auth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrustBffClientIp
{
    public function handle(Request $request, Closure $next): Response
    {
        $bffSecret = (string) config('customer_auth.bff.shared_secret', '');
        $incomingSecret = (string) $request->header('X-Bff-Secret', '');
        $forwardedIp = (string) $request->header('X-Client-Ip', '');

        if ($bffSecret !== '' && $incomingSecret !== '' && hash_equals($bffSecret, $incomingSecret)) {
            if ($forwardedIp !== '' && filter_var($forwardedIp, FILTER_VALIDATE_IP)) {
                $request->server->set('REMOTE_ADDR', $forwardedIp);
            }
        }

        return $next($request);
    }
}
