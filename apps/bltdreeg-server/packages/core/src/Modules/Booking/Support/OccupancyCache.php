<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Models\BarberSchedule;
use Bltdreeg\Core\Modules\Booking\Models\BarberTimeBlock;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

/**
 * Caches the engine's INPUTS, not its output (spec §5.1). Caching the computed grid
 * would need one entry per basket duration; the inputs are the same whatever the
 * basket, so the grid is derived from them in memory.
 *
 * Everything stored is a plain array — `config('cache.serializable_classes')` is
 * false, so a cached model would come back as __PHP_Incomplete_Class. Same reason
 * CachableModel caches raw attributes.
 */
final class OccupancyCache
{
    /**
     * @return array{windows: array<int, array{start_time: string, end_time: string}>, bookings: array<int, array{starts_at: string, ends_at: string}>, blocks: array<int, array{starts_at: string, ends_at: string}>}
     */
    public static function for(Branch $branch, User $barber, CarbonImmutable $localDay): array
    {
        return Cache::remember(
            self::key((int) $branch->getKey(), (int) $barber->getKey(), $localDay),
            (int) config('booking.occupancy_cache_seconds', 60),
            fn (): array => self::build($branch, $barber, $localDay),
        );
    }

    public static function forget(int $branchId, int $barberId, CarbonImmutable $localDay): void
    {
        Cache::forget(self::key($branchId, $barberId, $localDay));
    }

    /**
     * Used when a schedule or settings row changes, which affects every day rather
     * than one. The horizon is bounded, so clearing it day by day is cheap and needs
     * no tag support from the cache driver.
     */
    public static function forgetBarber(int $branchId, int $barberId, int $days = 400): void
    {
        $cursor = BookingTime::now()->startOfDay();

        for ($i = 0; $i <= $days; $i++) {
            self::forget($branchId, $barberId, $cursor->addDays($i));
        }
    }

    private static function key(int $branchId, int $barberId, CarbonImmutable $localDay): string
    {
        return "booking:occupancy:{$branchId}:{$barberId}:".$localDay->format('Y-m-d');
    }

    /** @return array<string, mixed> */
    private static function build(Branch $branch, User $barber, CarbonImmutable $localDay): array
    {
        $dayStart = $localDay->startOfDay()->utc();
        $dayEnd = $localDay->endOfDay()->utc();

        $windows = BarberSchedule::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->getKey())
            ->where('user_id', $barber->getKey())
            ->where('weekday', (int) $localDay->dayOfWeek)
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get(['start_time', 'end_time'])
            ->map(fn (BarberSchedule $row): array => [
                'start_time' => (string) $row->start_time,
                'end_time' => (string) $row->end_time,
            ])->all();

        // A booking's footprint runs past its end by the gap stored on it, so a
        // booking that starts before the day can still bleed into it.
        $bookings = Booking::query()
            ->withoutGlobalScopes()
            ->occupying()
            ->where('barber_user_id', $barber->getKey())
            ->whereBetween('starts_at', [$dayStart->subDay(), $dayEnd])
            ->get(['starts_at', 'ends_at', 'gap_minutes'])
            ->map(fn (Booking $booking): array => [
                'starts_at' => $booking->starts_at->utc()->toIso8601String(),
                'ends_at' => $booking->footprintEndsAt()->utc()->toIso8601String(),
            ])->all();

        $blocks = BarberTimeBlock::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->getKey())
            ->where('user_id', $barber->getKey())
            ->where('starts_at', '<', $dayEnd)
            ->where('ends_at', '>', $dayStart)
            ->get(['starts_at', 'ends_at'])
            ->map(fn (BarberTimeBlock $block): array => [
                'starts_at' => $block->starts_at->utc()->toIso8601String(),
                'ends_at' => $block->ends_at->utc()->toIso8601String(),
            ])->all();

        return ['windows' => $windows, 'bookings' => $bookings, 'blocks' => $blocks];
    }
}
