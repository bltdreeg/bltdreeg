<?php

namespace App\Modules\V1\Customer\Auth\Support;

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Laravel\Sanctum\NewAccessToken;

class CustomerTokenIssuer
{
    public const DEFAULT_TTL_DAYS = 90;

    /**
     * Issue a personal access token for a customer with device and platform details.
     */
    public function issue(
        Customer $customer,
        ?string $deviceName = null,
        ?string $platform = null,
    ): NewAccessToken {
        $name = $deviceName ?: ($platform ? "{$platform}_client" : 'customer_device');
        $ttlDays = (int) config('customer_auth.token_ttl_days', self::DEFAULT_TTL_DAYS);
        $expiresAt = now()->addDays($ttlDays);

        $token = $customer->createToken(
            name: $name,
            abilities: ['*'],
            expiresAt: $expiresAt,
        );

        $token->accessToken->forceFill([
            'device_name' => $deviceName,
            'platform' => $platform,
        ])->save();

        return $token;
    }
}
