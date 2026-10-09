<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;

/**
 * Builds a day's bookable starts from rules (spec §5): the barber's weekly windows,
 * stepped by slot_step_minutes, minus existing booking footprints, minus time
 * blocks, minus anything inside the minimum notice or beyond the horizon.
 *
 * Nothing is materialized: there are no slot rows at any point.
 */
final class AvailabilityEngine
{
    /** @return array<int, AvailableSlot> */
    public static function day(Branch $branch, User $barber, CarbonImmutable $date, int $basketDuration): array
    {
        if ($basketDuration <= 0) {
            return [];
        }

        $settings = BookingSettings::resolve($branch, $barber);

        if ($settings->isPaused) {
            return [];
        }

        $zone = BookingTime::zone();
        $day = $date->setTimezone($zone)->startOfDay();
        $today = BookingTime::now()->startOfDay();

        if ($day->lt($today) || $day->gt($today->addDays($settings->maxDaysAhead))) {
            return [];
        }

        $occupancy = OccupancyCache::for($branch, $barber, $day);

        if ($occupancy['windows'] === []) {
            return [];
        }

        $earliest = BookingTime::now()->addMinutes($settings->minNoticeMinutes);
        $busy = self::ranges($occupancy['bookings'], $occupancy['blocks']);

        $slots = [];
        $seen = [];

        foreach ($occupancy['windows'] as $window) {
            // Parsed in the branch zone, so a wall-clock time that DST skipped is
            // normalized to a real instant rather than silently invented.
            $windowStart = CarbonImmutable::parse($day->format('Y-m-d').' '.$window['start_time'], $zone);
            $windowEnd = CarbonImmutable::parse($day->format('Y-m-d').' '.$window['end_time'], $zone);

            // Step in absolute time: across a DST change the wall clock jumps, but the
            // sequence of real instants stays even and never repeats.
            for (
                $cursor = $windowStart;
                $cursor->addMinutes($basketDuration)->lte($windowEnd);
                $cursor = $cursor->addMinutes($settings->slotStepMinutes)
            ) {
                $endsAt = $cursor->addMinutes($basketDuration);
                $footprintEnd = $endsAt->addMinutes($settings->gapMinutes);
                $stamp = $cursor->getTimestamp();

                if (isset($seen[$stamp])) {
                    continue;
                }

                if ($cursor->lt($earliest)) {
                    continue;
                }

                if (self::overlapsAny($cursor, $footprintEnd, $busy)) {
                    continue;
                }

                $seen[$stamp] = true;

                $slots[] = new AvailableSlot(
                    startsAt: $cursor,
                    endsAt: $endsAt,
                    queueNumberPreview: QueueNumberProjector::preview($branch, $barber, $cursor),
                );
            }
        }

        usort($slots, fn (AvailableSlot $a, AvailableSlot $b): int => $a->startsAt <=> $b->startsAt);

        return $slots;
    }

    /** Whether one exact start is offered for that basket — the check a write makes. */
    public static function isBookable(Branch $branch, User $barber, CarbonImmutable $startsAt, int $basketDuration): bool
    {
        $target = $startsAt->setTimezone(BookingTime::zone());

        foreach (self::day($branch, $barber, $target, $basketDuration) as $slot) {
            if ($slot->startsAt->equalTo($target)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, array{starts_at: string, ends_at: string}>  ...$sets
     * @return array<int, array{0: CarbonImmutable, 1: CarbonImmutable}>
     */
    private static function ranges(array ...$sets): array
    {
        $ranges = [];

        foreach ($sets as $set) {
            foreach ($set as $range) {
                $ranges[] = [
                    CarbonImmutable::parse($range['starts_at']),
                    CarbonImmutable::parse($range['ends_at']),
                ];
            }
        }

        return $ranges;
    }

    /** @param  array<int, array{0: CarbonImmutable, 1: CarbonImmutable}>  $ranges */
    private static function overlapsAny(CarbonImmutable $start, CarbonImmutable $end, array $ranges): bool
    {
        foreach ($ranges as [$busyStart, $busyEnd]) {
            if ($start->lt($busyEnd) && $busyStart->lt($end)) {
                return true;
            }
        }

        return false;
    }
}
