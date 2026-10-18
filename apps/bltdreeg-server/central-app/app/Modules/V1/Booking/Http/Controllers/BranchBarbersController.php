<?php

namespace App\Modules\V1\Booking\Http\Controllers;

use Bltdreeg\Core\Modules\Queue\Enums\ChairStatusEnum;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Queue\Support\QueueEngine;
use Bltdreeg\Core\Modules\Queue\Support\QueueProjection;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class BranchBarbersController extends Controller
{
    /**
     * خطوة "اختار الحلاق": كل كرسي شغال عليه حلاق النهارده، وطابوره دلوقتي (قدامك كام + الانتظار المتوقع).
     * الدخول على طول متاح بس لو الفرع مفتوح؛ حجز ميعاد متاح دايماً (لو الكرسي ليه slots).
     */
    public function __invoke(int $branch, QueueEngine $engine): JsonResponse
    {
        $model = Branch::query()->publiclyListed()->findOrFail($branch);
        $today = CarbonImmutable::now(Slot::TIMEZONE);
        $locale = app()->getLocale();

        $barbers = Chair::query()
            ->where('branch_id', $model->id)
            ->where('status', ChairStatusEnum::Active)
            ->orderBy('position_no')
            ->get()
            ->map(function (Chair $chair) use ($engine, $today, $model): ?array {
                $barber = $chair->barberOn($today);

                if ($barber === null) {
                    return null;
                }

                $engine->startDueSlots(chairId: $chair->id);
                $queue = QueueProjection::forChair($chair);

                return [
                    'chair_id' => $chair->id,
                    'barber' => ['id' => $barber->id, 'name' => $barber->name, 'photo_url' => $barber->photo_url],
                    'can_join_now' => (bool) $model->is_open,
                    'queue' => [
                        'people_in_queue' => $queue->size(),
                        'expected_wait_minutes' => $queue->waitForNewJoiner(),
                    ],
                ];
            })
            ->filter()
            ->values();

        return response()->json([
            'branch' => [
                'id' => $model->id,
                'name' => $model->getTranslation('name', $locale),
                'is_open' => (bool) $model->is_open,
            ],
            'data' => $barbers,
        ]);
    }
}
