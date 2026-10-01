<?php

namespace App\Modules\V1\Customer\Auth\Social\Data;

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;

class SocialIdentity
{
    public function __construct(
        public readonly SocialProviderEnum $provider,
        public readonly string $providerUserId,
        public readonly ?string $email = null,
        public readonly bool $emailVerified = false,
        public readonly ?string $firstName = null,
        public readonly ?string $lastName = null,
    ) {}
}
