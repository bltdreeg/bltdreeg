<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

final readonly class BasketLine
{
    public function __construct(
        public ?int $serviceId,
        public ?int $packageId,
        public array $name,
        public float $price,
        public int $duration,
        public int $sort,
    ) {}

    /** @return array<string, mixed> */
    public function toItemAttributes(): array
    {
        return [
            'service_id' => $this->serviceId,
            'package_id' => $this->packageId,
            'name_snapshot' => $this->name,
            'price_snapshot' => $this->price,
            'duration_snapshot' => $this->duration,
            'sort' => $this->sort,
        ];
    }
}
