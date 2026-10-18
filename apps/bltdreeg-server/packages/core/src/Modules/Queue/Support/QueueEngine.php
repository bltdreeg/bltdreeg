<?php

namespace Bltdreeg\Core\Modules\Queue\Support;

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Queue\Enums\QueueEventTypeEnum;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationStatusEnum;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationTypeEnum;
use Bltdreeg\Core\Modules\Queue\Exceptions\QueueException;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\QueueEvent;
use Bltdreeg\Core\Modules\Queue\Models\Reservation;
use Bltdreeg\Core\Modules\Queue\Models\ReservationLine;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Services\Support\BranchCatalog;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * محرك الطابور (feature 1) — شريحة الحجز: دخول الطابور، حجز slot، الإلغاء، دخول أصحاب الـ slots
 * لما ميعادهم ييجي، وبداية/نهاية الخدمة (للداشبورد).
 *
 * القواعد:
 * - طابور حي واحد بس للعميل في كل الصالونات (queued/in_service). الـ slots المستقبلية مش بتتحسب.
 * - الـ slot مش appointment: صاحبه بيدخل الطابور لما الميعاد ييجي ورا اللي في الطابور، join_time = بداية الـ slot.
 * - أقصى 2 slots مستقبلية، ومفيش اتنين بنفس الميعاد.
 * - الدخول على طول محتاج الفرع مفتوح؛ حجز الـ slots مش مربوط بالفتح (feature 3).
 *
 * لسه مش هنا: التخطي/التأجيل (SB-C2)، سؤال تعارض الـ slot قبل الميعاد بإشعار (SB-C4 + الإشعارات) —
 * لحد ما يتعمل، التعارض عند البداية بيلغي الـ slot زي ما القاعدة بتقول لو مفيش رد.
 */
class QueueEngine
{
    public const MAX_FUTURE_SLOTS = 2;

    /**
     * @param  list<int>  $serviceIds
     */
    public function joinNow(Customer $customer, Chair $chair, array $serviceIds): Reservation
    {
        return DB::transaction(function () use ($customer, $chair, $serviceIds): Reservation {
            $this->lockCustomer($customer);
            $branch = $this->bookableBranch($chair);

            if (! $branch->is_open) {
                throw new QueueException('booking.branch_closed', 409);
            }

            $this->ensureChairHasBarber($chair, CarbonImmutable::now(Slot::TIMEZONE));
            $this->ensureNoLiveQueue($customer);
            $lines = $this->resolveLines($branch, $serviceIds);

            $reservation = Reservation::query()->create([
                'customer_id' => $customer->id,
                'branch_id' => $branch->id,
                'chair_id' => $chair->id,
                'type' => ReservationTypeEnum::JoinNow,
                'status' => ReservationStatusEnum::Queued,
                'join_time' => now(),
            ]);
            $this->storeLines($reservation, $lines);
            $this->record($reservation, $branch, QueueEventTypeEnum::Joined);

            return $reservation->load('lines');
        });
    }

    /**
     * @param  list<int>  $serviceIds
     */
    public function bookSlot(Customer $customer, Slot $slot, array $serviceIds): Reservation
    {
        return DB::transaction(function () use ($customer, $slot, $serviceIds): Reservation {
            $this->lockCustomer($customer);
            /** @var Slot $slot */
            $slot = Slot::query()->with('chair')->lockForUpdate()->findOrFail($slot->id);
            $branch = $this->bookableBranch($slot->chair);

            if ($slot->startsAt()->lessThanOrEqualTo(now())) {
                throw new QueueException('booking.slot_unavailable', 409);
            }

            $this->ensureChairHasBarber($slot->chair, CarbonImmutable::parse($slot->day->toDateString(), Slot::TIMEZONE));

            $futureSlots = Reservation::query()
                ->where('customer_id', $customer->id)
                ->where('status', ReservationStatusEnum::Booked)
                ->with('slot')
                ->get();

            if ($futureSlots->contains(fn (Reservation $r) => $r->slot_id === $slot->id)) {
                throw new QueueException('booking.slot_already_booked', 409);
            }

            if ($futureSlots->count() >= self::MAX_FUTURE_SLOTS) {
                throw new QueueException('booking.slot_limit', 409, ['limit' => self::MAX_FUTURE_SLOTS]);
            }

            if ($futureSlots->contains(fn (Reservation $r) => $r->slot?->startsAt()->equalTo($slot->startsAt()))) {
                throw new QueueException('booking.slot_same_time', 409);
            }

            if ($slot->remainingCapacity() === 0) {
                throw new QueueException('booking.slot_full', 409);
            }

            $lines = $this->resolveLines($branch, $serviceIds);

            $reservation = Reservation::query()->create([
                'customer_id' => $customer->id,
                'branch_id' => $branch->id,
                'chair_id' => $slot->chair_id,
                'slot_id' => $slot->id,
                'type' => ReservationTypeEnum::Slot,
                'status' => ReservationStatusEnum::Booked,
            ]);
            $this->storeLines($reservation, $lines);
            $this->record($reservation, $branch, QueueEventTypeEnum::SlotBooked);

            return $reservation->load('lines');
        });
    }

    /** إلغاء من غير غرامة في أي وقت قبل بداية الخدمة — اللي وراك بيتقدّموا لوحدهم (الترتيب projection) */
    public function cancel(Reservation $reservation): Reservation
    {
        return DB::transaction(function () use ($reservation): Reservation {
            /** @var Reservation $reservation */
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($reservation->id);

            if (! $reservation->status->isCancellable()) {
                throw new QueueException('booking.not_cancellable', 409);
            }

            $reservation->update(['status' => ReservationStatusEnum::Cancelled, 'cancel_at' => now()]);
            $this->record($reservation, $reservation->branch, QueueEventTypeEnum::Cancelled);

            return $reservation;
        });
    }

    /**
     * أصحاب الـ slots اللي ميعادها جه بيدخلوا الطابور (بترتيب الحجز جوه نفس الـ slot).
     * اللي عنده طابور حي تاني: الـ slot بيتلغي ويفضل في طابوره.
     *
     * بيتنادى من الـ scheduler كل دقيقة، ومن القراءات (عميل/كرسي) عشان الحالة تبقى صح حتى لو الـ scheduler
     * متأخر — join_time ثابت = بداية الـ slot، فوقت المعالجة مش بيغيّر الترتيب.
     *
     * @return int عدد الحجوزات اللي اتعالجت
     */
    public function startDueSlots(?CarbonInterface $now = null, ?int $customerId = null, ?int $chairId = null): int
    {
        $now = CarbonImmutable::instance($now ?? now());
        $processed = 0;

        Reservation::query()
            ->where('status', ReservationStatusEnum::Booked)
            ->whereNotNull('slot_id')
            ->when($customerId !== null, fn ($query) => $query->where('customer_id', $customerId))
            ->when($chairId !== null, fn ($query) => $query->where('chair_id', $chairId))
            ->whereHas('slot', fn ($slot) => $slot->whereDate('day', '<=', $now->setTimezone(Slot::TIMEZONE)->toDateString()))
            ->with('slot')
            ->orderBy('id')
            ->get()
            ->filter(fn (Reservation $r) => $r->slot !== null && $r->slot->startsAt()->lessThanOrEqualTo($now))
            ->each(function (Reservation $reservation) use (&$processed): void {
                DB::transaction(function () use ($reservation): void {
                    $customer = Customer::query()->lockForUpdate()->findOrFail($reservation->customer_id);
                    /** @var Reservation $fresh */
                    $fresh = Reservation::query()->lockForUpdate()->findOrFail($reservation->id);

                    if ($fresh->status !== ReservationStatusEnum::Booked) {
                        return;
                    }

                    if ($this->liveQueueOf($customer) !== null) {
                        $fresh->update(['status' => ReservationStatusEnum::Cancelled, 'cancel_at' => now()]);
                        $this->record($fresh, $fresh->branch, QueueEventTypeEnum::SlotConflictCancelled);

                        return;
                    }

                    $fresh->update([
                        'status' => ReservationStatusEnum::Queued,
                        'join_time' => $reservation->slot->startsAt(),
                    ]);
                    $this->record($fresh, $fresh->branch, QueueEventTypeEnum::SlotJoined);
                });
                $processed++;
            });

        return $processed;
    }

    /** الحلاق بدأ يخدم العميل (من الداشبورد) */
    public function startService(Reservation $reservation): Reservation
    {
        if ($reservation->status !== ReservationStatusEnum::Queued) {
            throw new QueueException('booking.not_in_queue', 409);
        }

        $reservation->update(['status' => ReservationStatusEnum::InService, 'started_at' => now()]);
        $this->record($reservation, $reservation->branch, QueueEventTypeEnum::ServiceStarted);

        return $reservation;
    }

    public function completeService(Reservation $reservation): Reservation
    {
        if ($reservation->status !== ReservationStatusEnum::InService) {
            throw new QueueException('booking.not_in_service', 409);
        }

        $reservation->update(['status' => ReservationStatusEnum::Served, 'served_at' => now()]);
        $this->record($reservation, $reservation->branch, QueueEventTypeEnum::Served);

        return $reservation;
    }

    public function liveQueueOf(Customer $customer): ?Reservation
    {
        return Reservation::query()
            ->where('customer_id', $customer->id)
            ->whereIn('status', ReservationStatusEnum::liveValues())
            ->first();
    }

    /** بيسلسل حجوزات نفس العميل (MySQL مالوش partial unique index للقاعدة) */
    private function lockCustomer(Customer $customer): void
    {
        Customer::query()->whereKey($customer->id)->lockForUpdate()->first();
    }

    private function bookableBranch(Chair $chair): Branch
    {
        $branch = Branch::query()->publiclyListed()->find($chair->branch_id);

        if ($branch === null || ! $chair->isActive()) {
            throw new QueueException('booking.chair_unavailable', 409);
        }

        return $branch;
    }

    private function ensureChairHasBarber(Chair $chair, CarbonInterface $day): void
    {
        if ($chair->barberOn($day) === null) {
            throw new QueueException('booking.chair_unavailable', 409);
        }
    }

    private function ensureNoLiveQueue(Customer $customer): void
    {
        $live = $this->liveQueueOf($customer);

        if ($live !== null) {
            throw new QueueException('booking.already_in_queue', 409, ['reservation_id' => $live->id]);
        }
    }

    /**
     * @param  list<int>  $serviceIds
     * @return list<array{service_id: int, price: float, duration: int}>
     */
    private function resolveLines(Branch $branch, array $serviceIds): array
    {
        $catalog = BranchCatalog::effective($branch);
        $ids = array_values(array_unique(array_map('intval', $serviceIds)));

        if ($ids === [] || collect($ids)->contains(fn (int $id) => ! $catalog->has($id))) {
            throw new QueueException('booking.invalid_services', 422);
        }

        return array_map(fn (int $id): array => [
            'service_id' => $id,
            'price' => $catalog[$id]['price'],
            'duration' => $catalog[$id]['duration'],
        ], $ids);
    }

    /**
     * @param  list<array{service_id: int, price: float, duration: int}>  $lines
     */
    private function storeLines(Reservation $reservation, array $lines): void
    {
        foreach ($lines as $index => $line) {
            ReservationLine::query()->create([
                'reservation_id' => $reservation->id,
                'line_no' => $index + 1,
                'item_type' => ReservationLine::ITEM_SERVICE,
                'service_id' => $line['service_id'],
                'price_at_booking' => $line['price'],
                'duration_at_booking' => $line['duration'],
            ]);
        }
    }

    private function record(Reservation $reservation, Branch $branch, QueueEventTypeEnum $type): void
    {
        QueueEvent::query()->create([
            'tenant_id' => $branch->tenant_id,
            'reservation_id' => $reservation->id,
            'type' => $type,
            'at' => now(),
        ]);
    }
}
