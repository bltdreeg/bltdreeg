<?php

namespace App\Modules\V1\Customer\Auth\Social\Concerns;

use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

trait DecodesJwksTokens
{
    /** بيتحقق من التوقيع والـ exp؛ الـ iss/aud/nonce مسؤولية كل مزوّد */
    protected function decode(string $idToken, string $jwksUrl, string $cacheKey): object
    {
        $jwks = Cache::remember($cacheKey, 3600, function () use ($jwksUrl) {
            $response = Http::timeout(5)->get($jwksUrl);
            if (! $response->successful()) {
                throw new CustomerAuthException('auth.social_token_invalid', 422);
            }

            return $response->json();
        });

        JWT::$leeway = 60;

        return JWT::decode($idToken, JWK::parseKeySet($jwks, 'RS256'));
    }
}
