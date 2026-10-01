<?php

namespace App\Modules\V1\Customer\Auth\Enums;

enum OtpPurposeEnum: string
{
    case Register = 'register';
    case Login = 'login';
    case ResetPassword = 'reset_password';
    case VerifyPhone = 'verify_phone';
    case VerifyEmail = 'verify_email';
}
