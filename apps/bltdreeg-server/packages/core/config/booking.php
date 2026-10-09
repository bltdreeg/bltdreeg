<?php

return [
    /*
     * Schedule windows are branch-local wall clock; bookings are stored UTC. Egypt
     * observes DST again as of 2023, so this must be a real zone, never a fixed offset.
     */
    'timezone' => env('BOOKING_TIMEZONE', 'Africa/Cairo'),

    /*
     * How long the engine's occupancy inputs stay cached. Short by design: a slot
     * someone just took must disappear, and writes bust the key anyway.
     */
    'occupancy_cache_seconds' => (int) env('BOOKING_OCCUPANCY_CACHE_SECONDS', 60),
];
