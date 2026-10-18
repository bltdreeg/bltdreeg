<?php

namespace App\Modules\V1\Booking\Http\Controllers;

use Bltdreeg\Core\Modules\Queue\Enums\ChairStatusEnum;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationStatusEnum;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class ChairSlotsController extends Controller
{
    public const HORIZON_DAYS = 14;

    /**
     * مواعيد الدخول الجاية لكرسي (لحد أسبوعين) اللي لسه فيها مكان. الـ slot مش ميعاد خدمة —
     * صاحبه بيدخل الطابور لما الوقت ييجي، ورا اللي في الطابور ساعتها.
     */
    public function __invoke(int $branch, int $chair): JsonResponse
    {
        $branchModel = Branch::query()->publiclyListed()->findOrFail($branch);
        $chairModel = Chair::query()
            ->where('branch_id', $branchModel->id)
            ->where('status', ChairStatusEnum::Active)
            ->findOrFail($chair);

        $slots = $chairModel->slots()
            ->upcoming()
            ->whereDate('day', '<=', now(Slot::TIMEZONE)->addDays(self::HORIZON_DAYS)->toDateString())
            ->withCount(['reservations as holders_count' => fn ($query) => $query->whereIn('status', [
                ReservationStatusEnum::Booked->value,
                ...ReservationStatusEnum::liveValues(),
            ])])
            ->orderBy('day')
            ->orderBy('start_at')
            ->get()
            ->filter(fn (Slot $slot) => $slot->holders_count < $slot->capacity)
            ->map(fn (Slot $slot) => [
                'id' => $slot->id,
                'starts_at' => $slot->startsAt()->toIso8601String(),
                'day' => $slot->day->toDateString(),
                'time' => substr((string) $slot->start_at, 0, 5),
                'remaining' => $slot->capacity - $slot->holders_count,
            ])
            ->values();

        return response()->json(['data' => $slots]);
    }
}
