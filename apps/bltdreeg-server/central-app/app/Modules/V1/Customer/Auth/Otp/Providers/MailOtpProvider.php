<?php

namespace App\Modules\V1\Customer\Auth\Otp\Providers;

use App\Modules\V1\Customer\Auth\Otp\Contracts\OtpProvider;
use App\Modules\V1\Customer\Auth\Otp\Data\DeliveryResult;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class MailOtpProvider implements OtpProvider
{
    public function send(OtpMessage $message): DeliveryResult
    {
        try {
            $subject = match ($message->locale) {
                'en' => 'Your Beltadreeg Verification Code',
                default => 'كود التحقق من بلتدرّيج',
            };

            $body = match ($message->locale) {
                'en' => "Your verification code is: {$message->code}. It will expire in 5 minutes.",
                default => "كود التحقق الخاص بك هو: {$message->code}. الكود صالح لمدة 5 دقائق.",
            };

            Mail::raw($body, function ($mail) use ($message, $subject) {
                $mail->to($message->recipient)->subject($subject);
            });

            return DeliveryResult::success('mail_'.Str::random(12));
        } catch (Throwable $e) {
            return DeliveryResult::failure($e->getMessage());
        }
    }
}
