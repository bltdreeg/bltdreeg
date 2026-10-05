<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Token TTL & Legal Terms
    |--------------------------------------------------------------------------
    */
    'token_ttl_days' => (int) env('CUSTOMER_TOKEN_TTL_DAYS', 90),
    'terms_version' => env('CUSTOMER_TERMS_VERSION', '1.0'),

    /*
    |--------------------------------------------------------------------------
    | OTP Rules & Providers
    |--------------------------------------------------------------------------
    */
    'otp' => [
        'code_length' => 6,
        'expiry_minutes' => 5,
        'default_provider' => env('OTP_DEFAULT_PROVIDER', 'log'),
        'fixed_code' => env('OTP_FIXED_CODE'),
        'max_wrong_attempts' => 5,
        'lock_minutes' => 15,
        'max_hourly_sends' => 5,
        'hourly_ip_limit' => 20,
    ],

    /*
    |--------------------------------------------------------------------------
    | Social Providers
    |--------------------------------------------------------------------------
    */
    'social' => [
        'google' => [
            'client_ids' => array_values(array_filter(explode(',', (string) env('GOOGLE_CLIENT_IDS', '')))),
        ],
        'apple' => [
            'enabled' => (bool) env('APPLE_AUTH_ENABLED', false),
            // Services ID للويب + Bundle ID للـ iOS، مفصولين بفاصلة
            'client_ids' => array_values(array_filter(explode(',', (string) env('APPLE_CLIENT_IDS', '')))),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Location Settings
    |--------------------------------------------------------------------------
    */
    'location' => [
        'maxmind_db_path' => database_path('geoip/GeoLite2-City.mmdb'),
    ],
];
