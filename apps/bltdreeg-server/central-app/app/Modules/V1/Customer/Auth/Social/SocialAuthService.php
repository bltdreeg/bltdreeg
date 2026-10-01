<?php

namespace App\Modules\V1\Customer\Auth\Social;

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;
use App\Modules\V1\Customer\Auth\Models\CustomerSocialAccount;
use App\Modules\V1\Customer\Auth\Social\Contracts\SocialTokenVerifier;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Support\Facades\DB;

class SocialAuthService
{
    public function __construct(
        protected readonly GoogleTokenVerifier $googleVerifier,
        protected readonly AppleTokenVerifier $appleVerifier,
    ) {}

    public function getVerifier(SocialProviderEnum $provider): SocialTokenVerifier
    {
        return match ($provider) {
            SocialProviderEnum::Google => $this->googleVerifier,
            SocialProviderEnum::Apple => $this->appleVerifier,
        };
    }

    /**
     * Find existing customer, link to existing verified email, or create new onboarding customer.
     */
    public function authenticate(
        SocialProviderEnum $provider,
        string $idToken,
        ?string $nonce = null,
        ?string $firstName = null,
        ?string $lastName = null,
    ): Customer {
        $verifier = $this->getVerifier($provider);
        $identity = $verifier->verify($idToken, $nonce);

        // 1. Existing link: provider + provider_user_id
        $existingLink = CustomerSocialAccount::query()
            ->where('provider', $identity->provider)
            ->where('provider_user_id', $identity->providerUserId)
            ->first();

        if ($existingLink) {
            return $existingLink->customer;
        }

        return DB::transaction(function () use ($identity, $firstName, $lastName) {
            // 2. Email match: token email is verified and matches a customer's verified email
            if ($identity->emailVerified && ! empty($identity->email)) {
                $matchedCustomer = Customer::query()
                    ->where('email', $identity->email)
                    ->whereNotNull('email_verified_at')
                    ->first();

                if ($matchedCustomer) {
                    CustomerSocialAccount::create([
                        'customer_id' => $matchedCustomer->id,
                        'provider' => $identity->provider,
                        'provider_user_id' => $identity->providerUserId,
                        'email' => $identity->email,
                    ]);

                    return $matchedCustomer;
                }
            }

            // 3. New customer (incomplete profile, requires onboarding)
            $customerEmail = null;
            $emailVerifiedAt = null;

            if ($identity->emailVerified && ! empty($identity->email)) {
                $emailTaken = Customer::query()
                    ->where('email', $identity->email)
                    ->exists();

                if (! $emailTaken) {
                    $customerEmail = $identity->email;
                    $emailVerifiedAt = now();
                }
            }

            $customer = Customer::create([
                'phone' => null,
                'phone_verified_at' => null,
                'first_name' => $firstName ?: $identity->firstName,
                'last_name' => $lastName ?: $identity->lastName,
                'email' => $customerEmail,
                'email_verified_at' => $emailVerifiedAt,
                'password' => null, // social-only account
                'is_active' => true,
                'locale' => 'ar',
            ]);

            CustomerSocialAccount::create([
                'customer_id' => $customer->id,
                'provider' => $identity->provider,
                'provider_user_id' => $identity->providerUserId,
                'email' => $identity->email,
            ]);

            return $customer;
        });
    }
}
