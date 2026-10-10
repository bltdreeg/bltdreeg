<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Booking\Events\BookingCancelled;
use Bltdreeg\Core\Modules\Booking\Events\BookingCreated;
use Bltdreeg\Core\Modules\Booking\Events\BookingRescheduled;
use Bltdreeg\Core\Modules\Booking\Exceptions\BookingException;
use Bltdreeg\Core\Modules\Booking\Models\Booking;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Every write to a booking goes through here (spec §6). Each one takes the barber's
 * day lock, re-validates against the engine, persists, and fires its event.
 *
 * MySQL cannot express an overlap constraint, so the lock plus the re-check is the
 * guard. SQLite ignores the lock, which is why the overlap rule itself is pure and
 * separately tested (OverlapGuard).
 */
class BookingService
{
    public function book(
        Branch $branch,
        User $barber,
        ResolvedBasket $basket,
        CarbonImmutable $startsAt,
        Customer $customer,
        ?string $notes = null,
    ): Booking {
        return $this->create(
            branch: $branch,
            barber: $barber,
            basket: $basket,
            startsAt: $startsAt,
            source: BookingSourceEnum::App,
            customer: $customer,
            notes: $notes,
        );
    }

    public function createManual(
        Branch $branch,
        User $barber,
        ResolvedBasket $basket,
        CarbonImmutable $startsAt,
        string $guestName,
        string $guestPhone,
        ?string $notes = null,
        bool $override = false,
        ?User $createdBy = null,
    ): Booking {
        return $this->create(
            branch: $branch,
            barber: $barber,
            basket: $basket,
            startsAt: $startsAt,
            source: BookingSourceEnum::Dashboard,
            guestName: $guestName,
            guestPhone: $guestPhone,
            notes: $notes,
            override: $override,
            createdBy: $createdBy,
        );
    }

    public function reschedule(Booking $booking, CarbonImmutable $startsAt, ?User $barber = null): Booking
    {
        if ($booking->status->isTerminal()) {
            throw BookingException::cutoffPassed();
        }

        $branch = $booking->branch;
        $settings = BookingSettings::resolve($branch, $booking->barber);

        if (BookingTime::now()->addMinutes($settings->cancelCutoffMinutes)->gt($booking->starts_at)) {
            throw BookingException::cutoffPassed();
        }

        $target = $barber ?? $booking->barber;
        $previous = $booking;

        $moved = DB::transaction(function () use ($booking, $branch, $target, $startsAt): Booking {
            $this->lockDay($target, $startsAt);
            $this->assertBookable($branch, $target, $startsAt, (int) $booking->duration_minutes, exceptBookingId: $booking->getKey());

            $fresh = Booking::query()->withoutGlobalScopes()->create([
                'tenant_id' => $booking->tenant_id,
                'branch_id' => $booking->branch_id,
                'barber_user_id' => $target->getKey(),
                'customer_id' => $booking->customer_id,
                'guest_name' => $booking->guest_name,
                'guest_phone' => $booking->guest_phone,
                'source' => $booking->source,
                'status' => BookingStatusEnum::Confirmed,
                'starts_at' => $startsAt->utc(),
                'ends_at' => $startsAt->addMinutes((int) $booking->duration_minutes)->utc(),
                'duration_minutes' => $booking->duration_minutes,
                'gap_minutes' => BookingSettings::resolve($branch, $target)->gapMinutes,
                'total_price' => $booking->total_price,
                'currency' => $booking->currency,
                'booking_code' => BookingCode::generate(),
                'notes' => $booking->notes,
                'is_forced' => false,
                'rescheduled_from_id' => $booking->getKey(),
            ]);

            foreach ($booking->items as $item) {
                $fresh->items()->create([
                    'service_id' => $item->service_id,
                    'package_id' => $item->package_id,
                    'name_snapshot' => $item->name_snapshot,
                    'price_snapshot' => $item->price_snapshot,
                    'duration_snapshot' => $item->duration_snapshot,
                    'sort' => $item->sort,
                ]);
            }

            $booking->update([
                'status' => BookingStatusEnum::Cancelled,
                'cancelled_at' => now(),
            ]);

            return $fresh->load('items');
        });

        BookingRescheduled::dispatch($moved, $previous);

        return $moved;
    }

    public function cancel(Booking $booking, bool $byCustomer): Booking
    {
        if ($booking->status->isTerminal()) {
            throw BookingException::cutoffPassed();
        }

        if ($byCustomer) {
            $settings = BookingSettings::resolve($booking->branch, $booking->barber);

            if (BookingTime::now()->addMinutes($settings->cancelCutoffMinutes)->gt($booking->starts_at)) {
                throw BookingException::cutoffPassed();
            }
        }

        $booking->update([
            'status' => BookingStatusEnum::Cancelled,
            'cancelled_at' => now(),
            'cancelled_by_customer' => $byCustomer,
        ]);

        $booking->refresh();

        BookingCancelled::dispatch($booking);

        return $booking;
    }

    public function markCompleted(Booking $booking): Booking
    {
        return $this->settle($booking, BookingStatusEnum::Completed);
    }

    public function markNoShow(Booking $booking): Booking
    {
        return $this->settle($booking, BookingStatusEnum::NoShow);
    }

    private function settle(Booking $booking, BookingStatusEnum $status): Booking
    {
        if ($booking->status->isTerminal()) {
            throw BookingException::cutoffPassed();
        }

        $booking->update(['status' => $status]);

        return $booking->refresh();
    }

    private function create(
        Branch $branch,
        User $barber,
        ResolvedBasket $basket,
        CarbonImmutable $startsAt,
        BookingSourceEnum $source,
        ?Customer $customer = null,
        ?string $guestName = null,
        ?string $guestPhone = null,
        ?string $notes = null,
        bool $override = false,
        ?User $createdBy = null,
    ): Booking {
        if ($customer === null && ($guestName === null || $guestPhone === null)) {
            throw BookingException::invalidBasket('A booking needs either a customer or a name and phone.');
        }

        $settings = BookingSettings::resolve($branch, $barber);

        $booking = DB::transaction(function () use (
            $branch, $barber, $basket, $startsAt, $source, $customer,
            $guestName, $guestPhone, $notes, $override, $createdBy, $settings
        ): Booking {
            $this->lockDay($barber, $startsAt);

            if (! $override) {
                $this->assertBookable($branch, $barber, $startsAt, $basket->totalDuration);
            }

            $booking = Booking::query()->withoutGlobalScopes()->create([
                'tenant_id' => $branch->tenant_id,
                'branch_id' => $branch->getKey(),
                'barber_user_id' => $barber->getKey(),
                'customer_id' => $customer?->getKey(),
                'guest_name' => $guestName,
                'guest_phone' => $guestPhone,
                'source' => $source,
                'status' => BookingStatusEnum::Confirmed,
                'starts_at' => $startsAt->utc(),
                'ends_at' => $startsAt->addMinutes($basket->totalDuration)->utc(),
                'duration_minutes' => $basket->totalDuration,
                'gap_minutes' => $settings->gapMinutes,
                'total_price' => $basket->totalPrice,
                'currency' => $basket->currency,
                'booking_code' => BookingCode::generate(),
                'notes' => $notes,
                'is_forced' => $override,
                'created_by_user_id' => $createdBy?->getKey(),
            ]);

            foreach ($basket->lines as $line) {
                $booking->items()->create($line->toItemAttributes());
            }

            return $booking->load('items');
        });

        BookingCreated::dispatch($booking);

        return $booking;
    }

    /**
     * Serialize writers touching the same barber and day. A no-op on SQLite, which
     * is why the test suite's race test skips rather than pretending to pass.
     */
    private function lockDay(User $barber, CarbonImmutable $startsAt): void
    {
        $day = BookingTime::day($startsAt);

        Booking::query()
            ->withoutGlobalScopes()
            ->where('barber_user_id', $barber->getKey())
            ->whereBetween('starts_at', [$day->startOfDay()->utc(), $day->endOfDay()->utc()])
            ->lockForUpdate()
            ->get(['id']);
    }

    /**
     * Re-ask the engine inside the lock. Availability is computed, so this is the
     * same question the customer's slot picker asked — just answered again now that
     * nobody else can write.
     */
    private function assertBookable(
        Branch $branch,
        User $barber,
        CarbonImmutable $startsAt,
        int $duration,
        int|string|null $exceptBookingId = null,
    ): void {
        $settings = BookingSettings::resolve($branch, $barber);

        if ($settings->isPaused) {
            throw BookingException::barberPaused();
        }

        // The booking being moved must not block its own new time. The status flip
        // below is a mass update through the query builder, so no model event fires
        // to invalidate the cache on our behalf; it is cleared by hand before AND
        // after the check (see the finally block) so no reader can ever see an
        // occupancy entry built from this transient, possibly-rolled-back state.
        if ($exceptBookingId !== null) {
            Booking::query()->withoutGlobalScopes()->whereKey($exceptBookingId)->update([
                'status' => BookingStatusEnum::Cancelled->value,
            ]);
            OccupancyCache::forget((int) $branch->getKey(), (int) $barber->getKey(), BookingTime::day($startsAt));
        }

        try {
            $bookable = AvailabilityEngine::isBookable($branch, $barber, $startsAt, $duration);
        } finally {
            // AvailabilityEngine::isBookable() just repopulated the occupancy cache
            // from the temporarily-altered row above. If this check throws (or even
            // if it doesn't — a concurrent reader could still have read the stale
            // entry), that cached value was built from data the caller's transaction
            // may roll back. Evict it immediately: the next reader rebuilds fresh
            // from whatever the final, committed state turns out to be.
            if ($exceptBookingId !== null) {
                OccupancyCache::forget((int) $branch->getKey(), (int) $barber->getKey(), BookingTime::day($startsAt));
            }
        }

        if (! $bookable) {
            throw BookingException::slotTaken();
        }
    }
}
