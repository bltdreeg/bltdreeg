<?php

namespace App\Modules\V1\Customer\Auth\Social\Contracts;

use App\Modules\V1\Customer\Auth\Social\Data\SocialIdentity;

interface SocialTokenVerifier
{
    public function verify(string $idToken, ?string $nonce = null): SocialIdentity;
}
