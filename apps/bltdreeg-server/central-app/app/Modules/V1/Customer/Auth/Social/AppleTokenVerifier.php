<?php

namespace App\Modules\V1\Customer\Auth\Social;

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Social\Concerns\DecodesJwksTokens;
use App\Modules\V1\Customer\Auth\Social\Contracts\SocialTokenVerifier;
use App\Modules\V1\Customer\Auth\Social\Data\SocialIdentity;
use Throwable;

class AppleTokenVerifier implements SocialTokenVerifier
{
    use DecodesJwksTokens;

    public const JWKS_URL = 'https://appleid.apple.com/auth/keys';

    public const JWKS_CACHE_KEY = 'customer_auth.apple_jwks';

    public function verify(string $idToken, ?string $nonce = null): SocialIdentity
    {
        $clientIds = (array) config('customer_auth.social.apple.client_ids', []);

        if (! config('customer_auth.social.apple.enabled', false) || $clientIds === []) {
            throw new CustomerAuthException('auth.provider_unavailable', 422);
        }

        if (app()->environment('testing') && str_starts_with($idToken, 'fake_apple_token_')) {
            $sub = substr($idToken, strlen('fake_apple_token_'));

            return new SocialIdentity(
                provider: SocialProviderEnum::Apple,
                providerUserId: $sub,
                email: "apple_user_{$sub}@privaterelay.appleid.com",
                emailVerified: true,
                firstName: 'Apple',
                lastName: 'User',
            );
        }

        try {
            $payload = $this->decode($idToken, self::JWKS_URL, self::JWKS_CACHE_KEY);

            // آبل لازم يبقى معاه nonce عشان نمنع إعادة استخدام توكن متسرّب
            if (($payload->iss ?? '') !== 'https://appleid.apple.com'
                || ! in_array($payload->aud ?? '', $clientIds, true)
                || $nonce === null
                || ! hash_equals($nonce, (string) ($payload->nonce ?? ''))) {
                throw new CustomerAuthException('auth.social_token_invalid', 422);
            }

            return new SocialIdentity(
                provider: SocialProviderEnum::Apple,
                providerUserId: (string) ($payload->sub ?? ''),
                email: isset($payload->email) ? (string) $payload->email : null,
                // آبل بيبعت email_verified كـ "true" نص أحياناً
                emailVerified: filter_var($payload->email_verified ?? false, FILTER_VALIDATE_BOOL),
                firstName: null, // الاسم بييجي من الـ client في أول دخول بس (spec §8.4)
                lastName: null,
            );
        } catch (CustomerAuthException $e) {
            throw $e;
        } catch (Throwable $e) {
            throw new CustomerAuthException('auth.social_token_invalid', 422, [], 'Invalid Apple ID token', $e);
        }
    }
}
