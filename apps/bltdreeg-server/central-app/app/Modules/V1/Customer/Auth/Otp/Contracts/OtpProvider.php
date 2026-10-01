<?php

namespace App\Modules\V1\Customer\Auth\Otp\Contracts;

use App\Modules\V1\Customer\Auth\Otp\Data\DeliveryResult;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;

interface OtpProvider
{
    public function send(OtpMessage $message): DeliveryResult;
}
