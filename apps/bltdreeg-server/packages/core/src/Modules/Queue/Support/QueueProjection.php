<?php

namespace Bltdreeg\Core\Modules\Queue\Support;

use Bltdreeg\Core\Modules\Queue\Enums\ReservationStatusEnum;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\Reservation;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * طابور كرسي كـ projection لحظي (مش متخزن): اللي بيتخدم الأول، وبعده المستنيين بترتيب join_time.
 *
 * - "قدامك كام" = عدد اللي قبلك في الترتيب (اللي بيتخدم بيتحسب).
 * - الانتظار المتوقع = اللي فاضل من خدمة اللي على الكرسي + مجموع مدد اللي قدامك (snapshot وقت الحجز).
 *
 * التخطي والتأجيل (SB-C2) لسه مش متطبقين، فالترتيب = join_time ثم id.
 */
class QueueProjection
{
    /** @var Collection<int, Reservation> */
    private Collection $line;

    private function __construct(
        private readonly CarbonInterface $now,
        Collection $reservations,
    ) {
        $this->line = $reservations
            ->sortBy(fn (Reservation $r) => [
                $r->status === ReservationStatusEnum::InService ? 0 : 1,
                $r->join_time?->getTimestamp() ?? PHP_INT_MAX,
                $r->id,
            ])
            ->values();
    }

    public static function forChair(Chair $chair, ?CarbonInterface $now = null): self
    {
        $reservations = Reservation::query()
            ->where('chair_id', $chair->id)
            ->whereIn('status', ReservationStatusEnum::liveValues())
            ->with('lines')
            ->get();

        return new self($now ?? now(), $reservations);
    }

    /** عدد اللي في الطابور دلوقتي (شامل اللي بيتخدم) */
    public function size(): int
    {
        return $this->line->count();
    }

    /** الانتظار المتوقع لحد ما ييجي دور واحد بيدخل دلوقتي */
    public function waitForNewJoiner(): int
    {
        return $this->waitBefore($this->line->count());
    }

    /**
     * مكان حجز في الطابور، أو null لو مش في الطابور الحي.
     *
     * @return array{people_ahead: int, expected_wait_minutes: int, is_your_turn: bool, in_service: bool}|null
     */
    public function positionOf(Reservation $reservation): ?array
    {
        $index = $this->line->search(fn (Reservation $r) => $r->id === $reservation->id);

        if ($index === false) {
            return null;
        }

        $inService = $this->line[$index]->status === ReservationStatusEnum::InService;
        $peopleAhead = (int) $index;

        return [
            'people_ahead' => $peopleAhead,
            'expected_wait_minutes' => $inService ? 0 : $this->waitBefore($peopleAhead),
            // دورك = الكرسي فاضي ومفيش حد قبلك
            'is_your_turn' => ! $inService && $peopleAhead === 0,
            'in_service' => $inService,
        ];
    }

    /** مجموع مدد أول $count في الطابور، واللي بيتخدم بيتحسب الباقي من خدمته بس */
    private function waitBefore(int $count): int
    {
        return (int) $this->line->take($count)->sum(function (Reservation $r): int {
            $duration = $r->totalDuration();

            if ($r->status === ReservationStatusEnum::InService && $r->started_at !== null) {
                $elapsed = (int) floor($r->started_at->diffInMinutes($this->now, absolute: true));

                return max(0, $duration - $elapsed);
            }

            return $duration;
        });
    }
}
