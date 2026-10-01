<?php

namespace App\Modules\V1\Customer\Auth\Social;

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Social\Contracts\SocialTokenVerifier;
use App\Modules\V1\Customer\Auth\Social\Data\SocialIdentity;

class AppleTokenVerifier implements SocialTokenVerifier
{
    public function verify(string $idToken, ?string $nonce = null): SocialIdentity
    {
        $enabled = config('customer_auth.social.apple.enabled', false);

        if (! $enabled) {
            throw new CustomerAuthException('auth.provider_unavailable', 422);
        }

        if (app()->environment('testing', 'local') && str_starts_with($idToken, 'fake_apple_token_')) {
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

        // Apple verification when enabled will parse Apple's JWKS
        throw new CustomerAuthException('auth.provider_unavailable', 422);
    }
}
