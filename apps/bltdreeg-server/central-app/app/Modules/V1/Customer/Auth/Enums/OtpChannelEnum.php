<?php

namespace App\Modules\V1\Customer\Auth\Enums;

enum OtpChannelEnum: string
{
    case WhatsApp = 'whatsapp';
    case Sms = 'sms';
    case Email = 'email';

    public function isPhoneChannel(): bool
    {
        return $this === self::WhatsApp || $this === self::Sms;
    }
}
