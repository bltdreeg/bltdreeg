<?php

namespace Bltdreeg\Core\Modules\Booking\Concerns;

use Bltdreeg\Core\Modules\Booking\Support\BookingTime;
use Bltdreeg\Core\Modules\Booking\Support\OccupancyCache;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * Keeps the occupancy cache honest: a slot someone just took has to disappear now,
 * not when the 60-second TTL lapses. Models that carry a date invalidate that day;
 * schedules and settings affect every day, so they clear the barber's whole horizon.
 */
trait InvalidatesOccupancy
{
    public static function bootInvalidatesOccupancy(): void
    {
        static::saved(fn (Model $model) => $model->invalidateOccupancy());
        static::deleted(fn (Model $model) => $model->invalidateOccupancy());
    }

    public function invalidateOccupancy(): void
    {
        $branchId = (int) $this->getAttribute('branch_id');
        $barberId = (int) ($this->getAttribute('barber_user_id') ?? $this->getAttribute('user_id'));

        if ($branchId === 0 || $barberId === 0) {
            return;
        }

        foreach ($this->occupancyDays() as $day) {
            OccupancyCache::forget($branchId, $barberId, $day);
        }
    }

    /**
     * The days this record affects. Null from a subclass means "all of them".
     *
     * @return array<int, CarbonImmutable>
     */
    protected function occupancyDays(): array
    {
        $days = [];

        foreach (['starts_at', 'ends_at'] as $attribute) {
            $value = $this->getAttribute($attribute);

            if ($value === null) {
                continue;
            }

            $days[] = BookingTime::day(CarbonImmutable::parse($value));
        }

        if ($days === []) {
            // No date on the record (a schedule or a settings row): clear the horizon.
            OccupancyCache::forgetBarber(
                (int) $this->getAttribute('branch_id'),
                (int) ($this->getAttribute('barber_user_id') ?? $this->getAttribute('user_id')),
            );

            return [];
        }

        // A block can span days; walk from the first to the last.
        $first = min($days);
        $last = max($days);
        $span = [];

        for ($cursor = $first; $cursor->lte($last); $cursor = $cursor->addDay()) {
            $span[] = $cursor;

            if (count($span) > 400) {
                break;
            }
        }

        // Also clear the previous day: a booking's gap can bleed across midnight.
        $span[] = $first->subDay();

        return $span;
    }
}
