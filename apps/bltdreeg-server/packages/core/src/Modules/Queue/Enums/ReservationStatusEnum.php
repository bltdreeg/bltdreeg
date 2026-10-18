<?php

namespace Bltdreeg\Core\Modules\Queue\Enums;

enum ReservationStatusEnum: string
{
    /** slot محجوز لسه ميعاده مجاش */
    case Booked = 'booked';

    /** في الطابور الحي مستني دوره */
    case Queued = 'queued';

    case InService = 'in_service';

    case Served = 'served';

    case Cancelled = 'cancelled';

    /** اتشال من الطابور (غياب مرتين، أو تعارض slot مع طابور شغال) */
    case Removed = 'removed';

    /** في طابور حي دلوقتي — قاعدة "طابور حي واحد بس للعميل" بتعد دول */
    public function isLive(): bool
    {
        return $this === self::Queued || $this === self::InService;
    }

    /** لسه ممكن يتلغي (قبل ما الخدمة تبدأ) */
    public function isCancellable(): bool
    {
        return $this === self::Booked || $this === self::Queued;
    }

    public function isFinished(): bool
    {
        return in_array($this, [self::Served, self::Cancelled, self::Removed], true);
    }

    /**
     * @return list<string>
     */
    public static function liveValues(): array
    {
        return [self::Queued->value, self::InService->value];
    }
}
