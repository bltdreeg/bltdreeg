<?php

namespace App\Modules\V1\Customer\Auth\Otp\Providers;

use App\Modules\V1\Customer\Auth\Otp\Contracts\OtpProvider;
use App\Modules\V1\Customer\Auth\Otp\Data\DeliveryResult;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LogOtpProvider implements OtpProvider
{
    public function send(OtpMessage $message): DeliveryResult
    {
        $id = 'log_'.Str::random(12);

        Log::info("[OTP:{$message->channel->value}] Sending code {$message->code} to {$message->recipient} for {$message->purpose->value}", [
            'provider' => 'log',
            'channel' => $message->channel->value,
            'recipient' => $message->recipient,
            'purpose' => $message->purpose->value,
            'code' => $message->code,
        ]);

        return DeliveryResult::success($id);
    }
}
