<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberBookingSettings;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;

/**
 * The effective booking rules for one barber at one branch: the barber's overrides
 * resolved against the branch defaults (spec §4.5, §4.4).
 */
final readonly class BookingSettings
{
    public function __construct(
        public int $slotStepMinutes,
        public int $gapMinutes,
        public bool $isPaused,
        public int $maxDaysAhead,
        public int $minNoticeMinutes,
        public int $cancelCutoffMinutes,
    ) {}

    public static function resolve(Branch $branch, User $barber): self
    {
        $row = BarberBookingSettings::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->getKey())
            ->where('user_id', $barber->getKey())
            ->first();

        return new self(
            slotStepMinutes: $row?->slot_step_minutes ?? (int) $branch->booking_slot_step_minutes,
            gapMinutes: $row?->gap_minutes ?? (int) $branch->booking_gap_minutes,
            isPaused: (bool) ($row?->is_paused ?? false),
            maxDaysAhead: $row?->max_days_ahead ?? (int) $branch->booking_days_ahead,
            minNoticeMinutes: $row?->min_notice_minutes ?? (int) $branch->booking_min_notice_minutes,
            // Cancel/reschedule is a branch policy; a barber has no override for it.
            cancelCutoffMinutes: (int) $branch->booking_cancel_cutoff_minutes,
        );
    }
}
