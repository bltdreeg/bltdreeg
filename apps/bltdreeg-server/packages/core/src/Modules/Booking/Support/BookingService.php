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
 * Every write to a booking goes through here (spec §6). Each one locks the barber,
 * re-validates against the engine, persists, and fires its event.
 *
 * MySQL cannot express an overlap constraint, so the lock plus the re-check is the
 * guard — and the re-check reads the database directly, never the occupancy cache
 * (spec §4.11: "re-run the overlap check against the locked set"). A cached value
 * can be stale relative to a concurrent writer's not-yet-committed insert, or built
 * from this same request's own temporary, possibly-rolled-back state. SQLite
 * ignores the lock, which is why the overlap rule itself is pure and separately
 * tested (OverlapGuard).
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

        $this->assertBarberIsBookable($branch, $target);

        $moved = DB::transaction(function () use ($booking, $branch, $target, $startsAt): Booking {
            $this->lockBarber($target);
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

        $this->assertBarberIsBookable($branch, $barber);

        $settings = BookingSettings::resolve($branch, $barber);

        $booking = DB::transaction(function () use (
            $branch, $barber, $basket, $startsAt, $source, $customer,
            $guestName, $guestPhone, $notes, $override, $createdBy, $settings
        ): Booking {
            $this->lockBarber($barber);

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
     * A barber must be a real, active, bookable employee of this branch (spec
     * §4.4) — not merely "has a schedule row". Checked unconditionally, even when
     * the caller is overriding scheduling rules: override lets a tenant force a
     * booking outside business hours, never onto an id that isn't a legitimate
     * barber here, including one from another tenant.
     */
    private function assertBarberIsBookable(Branch $branch, User $barber): void
    {
        if (! BookableBarbers::includes($branch, $barber)) {
            throw BookingException::barberPaused();
        }
    }

    /**
     * Serializes writers for one barber for the life of this transaction, by
     * locking the barber's own row rather than the day's booking rows: `SELECT …
     * FOR UPDATE` over zero matching rows locks nothing, so a day with no
     * bookings yet had no mutex at all for its very first write (spec §4.11
     * needs the first booking of the day serialized too). A no-op on SQLite,
     * which is why the test suite's race test skips rather than pretending to
     * pass.
     */
    private function lockBarber(User $barber): void
    {
        DB::table('users')->where('id', $barber->getKey())->lockForUpdate()->first(['id']);
    }

    /**
     * Re-ask the engine inside the lock, reading the database directly rather
     * than the occupancy cache (spec §4.11) — this is the same question the
     * customer's slot picker asked, just answered again now that nobody else can
     * write, against data the cache's TTL cannot make stale.
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

        // The booking being moved must not block its own new time. This mutation
        // is visible only inside this transaction — and only to the check below,
        // which reads the database directly and touches no cache — so the
        // caller's transaction can roll it back on refusal with nothing left over
        // anywhere for another reader to see.
        if ($exceptBookingId !== null) {
            Booking::query()->withoutGlobalScopes()->whereKey($exceptBookingId)->update([
                'status' => BookingStatusEnum::Cancelled->value,
            ]);
        }

        if (! AvailabilityEngine::isBookable($branch, $barber, $startsAt, $duration, useCache: false)) {
            throw BookingException::slotTaken();
        }
    }
}
