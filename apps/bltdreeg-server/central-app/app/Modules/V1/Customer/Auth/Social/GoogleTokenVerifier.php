<?php

namespace App\Modules\V1\Customer\Auth\Social;

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Social\Concerns\DecodesJwksTokens;
use App\Modules\V1\Customer\Auth\Social\Contracts\SocialTokenVerifier;
use App\Modules\V1\Customer\Auth\Social\Data\SocialIdentity;
use Throwable;

class GoogleTokenVerifier implements SocialTokenVerifier
{
    use DecodesJwksTokens;

    public const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

    public const JWKS_CACHE_KEY = 'customer_auth.google_jwks';

    public function verify(string $idToken, ?string $nonce = null): SocialIdentity
    {
        $clientIds = (array) config('customer_auth.social.google.client_ids', []);

        // الـ fake token لبيئة testing بس، عشان سيرفر local متاح على الشبكة ميتدخلش بيه
        if (app()->environment('testing') && str_starts_with($idToken, 'fake_google_token_')) {
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

        if ($clientIds === []) {
            // من غير client id أي توكن جوجل لأي تطبيق كان هيتقبل
            throw new CustomerAuthException('auth.provider_unavailable', 422);
        }

        try {
            $payload = $this->decode($idToken, self::JWKS_URL, self::JWKS_CACHE_KEY);

            if (! in_array($payload->iss ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)
                || ! in_array($payload->aud ?? '', $clientIds, true)
                || ($nonce !== null && ! hash_equals($nonce, (string) ($payload->nonce ?? '')))) {
                throw new CustomerAuthException('auth.social_token_invalid', 422);
            }

            return new SocialIdentity(
                provider: SocialProviderEnum::Google,
                providerUserId: (string) ($payload->sub ?? ''),
                email: isset($payload->email) ? (string) $payload->email : null,
                emailVerified: filter_var($payload->email_verified ?? false, FILTER_VALIDATE_BOOL),
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
