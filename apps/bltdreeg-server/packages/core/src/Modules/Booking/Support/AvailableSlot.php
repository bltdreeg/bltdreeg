<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Carbon\CarbonImmutable;

final readonly class AvailableSlot
{
    public function __construct(
        public CarbonImmutable $startsAt,
        public CarbonImmutable $endsAt,
        public int $queueNumberPreview,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'starts_at' => $this->startsAt->toIso8601String(),
            'ends_at' => $this->endsAt->toIso8601String(),
            'queue_number_preview' => $this->queueNumberPreview,
        ];
    }
}
