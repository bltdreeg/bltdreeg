<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;

final readonly class ResolvedBasket
{
    /** @param array<int, BasketLine> $lines */
    public function __construct(
        public array $lines,
        public int $totalDuration,
        public float $totalPrice,
        public CurrencyEnum $currency,
    ) {}
}
