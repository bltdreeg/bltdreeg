<?php

namespace Bltdreeg\Core\Modules\Booking\Events;

use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Illuminate\Foundation\Events\Dispatchable;

/** Nothing listens yet. This is the seam the notifications feature plugs into. */
class BookingRescheduled
{
    use Dispatchable;

    public function __construct(
        public readonly Booking $booking,
        public readonly Booking $previous,
    ) {}
}
