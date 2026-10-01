<?php

namespace App\Modules\V1\Customer\Auth\Social;

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Social\Contracts\SocialTokenVerifier;
use App\Modules\V1\Customer\Auth\Social\Data\SocialIdentity;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class GoogleTokenVerifier implements SocialTokenVerifier
{
    public const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

    public const JWKS_CACHE_KEY = 'customer_auth.google_jwks';

    public function verify(string $idToken, ?string $nonce = null): SocialIdentity
    {
        $clientIds = config('customer_auth.social.google.client_ids', []);

        // Allow bypassing or mocking in testing environment
        if (app()->environment('testing', 'local') && str_starts_with($idToken, 'fake_google_token_')) {
            $sub = substr($idToken, strlen('fake_google_token_'));

            return new SocialIdentity(
                provider: SocialProviderEnum::Google,
                providerUserId: $sub,
                email: "user_{$sub}@gmail.com",
                emailVerified: true,
                firstName: 'Google',
                lastName: 'User',
            );
        }

        try {
            $jwks = Cache::remember(self::JWKS_CACHE_KEY, 3600, function () {
                $response = Http::get(self::JWKS_URL);
                if (! $response->successful()) {
                    throw new CustomerAuthException('auth.social_token_invalid', 422);
                }

                return $response->json();
            });

            $keys = JWK::parseKeySet($jwks);
            $payload = JWT::decode($idToken, $keys);

            // Validate issuer
            if (! in_array($payload->iss ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)) {
                throw new CustomerAuthException('auth.social_token_invalid', 422);
            }

            // Validate audience
            $aud = $payload->aud ?? '';
            if (! empty($clientIds) && ! in_array($aud, (array) $clientIds, true)) {
                throw new CustomerAuthException('auth.social_token_invalid', 422);
            }

            return new SocialIdentity(
                provider: SocialProviderEnum::Google,
                providerUserId: (string) ($payload->sub ?? ''),
                email: isset($payload->email) ? (string) $payload->email : null,
                emailVerified: (bool) ($payload->email_verified ?? false),
                firstName: isset($payload->given_name) ? (string) $payload->given_name : null,
                lastName: isset($payload->family_name) ? (string) $payload->family_name : null,
            );
        } catch (CustomerAuthException $e) {
            throw $e;
        } catch (Throwable $e) {
            throw new CustomerAuthException('auth.social_token_invalid', 422, [], 'Invalid Google ID token', $e);
        }
    }
}
