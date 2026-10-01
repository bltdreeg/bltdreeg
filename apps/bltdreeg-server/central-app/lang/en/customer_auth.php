<?php

return [
    'errors' => [
        'auth' => [
            'unauthenticated' => 'Unauthenticated.',
            'onboarding_required' => 'Personal onboarding required to proceed.',
            'account_disabled' => 'This account has been disabled. Please contact support.',
            'social_conflict' => 'This social account is already linked to another user.',
            'invalid_credentials' => 'Invalid credentials.',
            'phone_not_registered' => 'Phone number is not registered.',
            'account_not_found' => 'Account not found.',
            'phone_taken' => 'Phone number is already taken.',
            'email_taken' => 'Email address is already taken.',
            'otp_invalid' => 'Invalid verification code.',
            'otp_expired' => 'Verification code has expired.',
            'otp_locked' => 'Too many wrong attempts. Challenge is temporarily locked.',
            'otp_resend_too_soon' => 'Please wait before requesting a new code.',
            'reset_token_invalid' => 'Password reset token is invalid or expired.',
            'social_token_invalid' => 'Invalid social authentication token.',
            'provider_unavailable' => 'Authentication provider is currently unavailable.',
            'channel_unavailable' => 'Selected delivery channel is currently unavailable.',
            'otp_send_limit' => 'You have exceeded the maximum hourly verification code limit.',
            'too_many_requests' => 'Too many requests. Please try again later.',
            'delivery_failed' => 'Failed to deliver verification code. Please try again.',
        ],
        'validation' => [
            'failed' => 'The given data was invalid.',
        ],
    ],
    'messages' => [
        'otp_subject' => 'Your Beltadreeg Verification Code',
        'otp_body' => 'Your verification code is: :code. It will expire in 5 minutes.',
    ],
];
