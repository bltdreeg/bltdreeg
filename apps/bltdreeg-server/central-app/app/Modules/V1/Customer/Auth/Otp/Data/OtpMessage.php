<?php

namespace App\Modules\V1\Customer\Auth\Otp\Data;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;

class OtpMessage
{
    public function __construct(
        public readonly string $recipient,
        public readonly string $code,
        public readonly OtpPurposeEnum $purpose,
        public readonly string $locale = 'ar',
        public readonly OtpChannelEnum $channel = OtpChannelEnum::Sms,
    ) {}
}
