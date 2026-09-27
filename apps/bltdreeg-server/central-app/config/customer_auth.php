<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OTP
    |--------------------------------------------------------------------------
    */

    'otp' => [
        'length' => 6,
        'expires_minutes' => 5,
        'max_attempts' => 5,
        'lock_minutes' => 15,
        'resend_cooldowns_seconds' => [60, 120, 300],
        'max_sends_per_identifier_per_hour' => 5,
        'max_sends_per_ip_per_hour' => 20,
        'fixed_code' => env('OTP_FIXED_CODE'),
        'providers' => [
            'log' => [
                'driver' => 'log',
                'channels' => ['whatsapp', 'sms'],
            ],
            'fake' => [
                'driver' => 'fake',
                'channels' => ['whatsapp', 'sms', 'email'],
            ],
            'mail' => [
                'driver' => 'mail',
                'channels' => ['email'],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tokens
    |--------------------------------------------------------------------------
    */

    'token_ttl_days' => 90,

    /*
    |--------------------------------------------------------------------------
    | Terms
    |--------------------------------------------------------------------------
    */

    'terms_version' => env('CUSTOMER_TERMS_VERSION', '1.0'),

    /*
    |--------------------------------------------------------------------------
    | Social login
    |--------------------------------------------------------------------------
    */

    'social' => [
        'google' => [
            'enabled' => (bool) env('CUSTOMER_GOOGLE_LOGIN_ENABLED', false),
            'client_id' => env('CUSTOMER_GOOGLE_CLIENT_ID'),
        ],
        'apple' => [
            'enabled' => (bool) env('CUSTOMER_APPLE_LOGIN_ENABLED', false),
            'client_id' => env('CUSTOMER_APPLE_CLIENT_ID'),
            'team_id' => env('CUSTOMER_APPLE_TEAM_ID'),
            'key_id' => env('CUSTOMER_APPLE_KEY_ID'),
            'private_key' => env('CUSTOMER_APPLE_PRIVATE_KEY'),
        ],
    ],

];
