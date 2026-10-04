<?php

/*
| The customer web app calls the API straight from the browser, so CORS is open for its origin(s) only.
| Auth uses Bearer tokens, not cookies, so credentials are not supported.
*/
return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:3213')))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Retry-After'],

    'max_age' => 600,

    'supports_credentials' => false,
];
