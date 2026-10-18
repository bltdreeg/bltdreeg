<?php

namespace App\Modules\V1\Booking\Http\Controllers;

use App\Modules\V1\Booking\Http\Requests\StoreReservationRequest;
use App\Modules\V1\Booking\Http\Resources\ReservationResource;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationStatusEnum;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationTypeEnum;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\Reservation;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Queue\Support\QueueEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

class ReservationsController extends Controller
{
    public const PER_PAGE = 20;

    private const RELATIONS = ['branch.tenant', 'chair', 'slot', 'lines.service'];

    public function __construct(private readonly QueueEngine $engine) {}

    /**
     * حجوزاتي: scope=active (الطابور الحي + الـ slots الجاية، الأقرب الأول) أو past (اللي خلص، الأحدث الأول).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $customer = $this->customer($request);
        $this->engine->startDueSlots(customerId: $customer->id);
        $past = $request->query('scope') === 'past';

        $statuses = $past
            ? [ReservationStatusEnum::Served, ReservationStatusEnum::Cancelled, ReservationStatusEnum::Removed]
            : [ReservationStatusEnum::Booked, ReservationStatusEnum::Queued, ReservationStatusEnum::InService];

        $reservations = Reservation::query()
            ->where('customer_id', $customer->id)
            ->whereIn('status', array_map(fn ($status) => $status->value, $statuses))
            ->with(self::RELATIONS)
            ->when($past, fn ($query) => $query->latest('updated_at'), fn ($query) => $query->orderByRaw('join_time IS NULL')->orderBy('join_time')->orderBy('id'))
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return ReservationResource::collection($reservations);
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $customer = $this->customer($request);

        $reservation = $request->reservationType() === ReservationTypeEnum::JoinNow
            ? $this->engine->joinNow($customer, Chair::query()->findOrFail($request->integer('chair_id')), $request->serviceIds())
            : $this->engine->bookSlot($customer, Slot::query()->findOrFail($request->integer('slot_id')), $request->serviceIds());

        return (new ReservationResource($reservation->load(self::RELATIONS)))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, int $reservation): ReservationResource
    {
        $customer = $this->customer($request);
        $this->engine->startDueSlots(customerId: $customer->id);

        return new ReservationResource($this->owned($customer, $reservation));
    }

    public function cancel(Request $request, int $reservation): ReservationResource
    {
        $customer = $this->customer($request);
        $model = $this->engine->cancel($this->owned($customer, $reservation));

        return new ReservationResource($model->fresh(self::RELATIONS));
    }

    /** حجز عميل تاني = 404 (مش 403) عشان منكشفش إن الـ id موجود */
    private function owned(Customer $customer, int $id): Reservation
    {
        return Reservation::query()
            ->where('customer_id', $customer->id)
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    private function customer(Request $request): Customer
    {
        /** @var Customer */
        return $request->user('customer');
    }
}
