<?php

namespace App\Modules\V1\Booking\Http\Resources;

use Bltdreeg\Core\Modules\Queue\Models\Reservation;
use Bltdreeg\Core\Modules\Queue\Models\ReservationLine;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Queue\Support\QueueProjection;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * حجز العميل: الفرع والحلاق والخدمات بسعرها وقت الحجز، والمكان في الطابور لحظياً (لو في الطابور الحي).
 *
 * @property-read Reservation $resource
 */
class ReservationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $reservation = $this->resource;
        $locale = app()->getLocale();
        $branch = $reservation->branch;
        $slot = $reservation->slot;
        $day = $slot !== null
            ? CarbonImmutable::parse($slot->day->toDateString(), Slot::TIMEZONE)
            : CarbonImmutable::instance($reservation->join_time ?? $reservation->created_at)->setTimezone(Slot::TIMEZONE);
        $barber = $reservation->chair->barberOn($day);

        return [
            'id' => $reservation->id,
            'type' => $reservation->type->value,
            'status' => $reservation->status->value,
            'join_time' => $reservation->join_time?->toIso8601String(),
            'slot' => $slot === null ? null : [
                'id' => $slot->id,
                'starts_at' => $slot->startsAt()->toIso8601String(),
            ],
            'branch' => [
                'id' => $branch->id,
                'name' => $branch->getTranslation('name', $locale),
                'address' => $branch->getTranslation('address', $locale) ?: null,
                'phone' => $branch->phone,
                'maps_url' => $branch->maps_url,
                'lat' => (float) $branch->latitude,
                'lng' => (float) $branch->longitude,
                'cover_image_url' => $branch->coverImageUrl(),
                'salon' => ['id' => $branch->tenant->id, 'name' => $branch->tenant->name],
            ],
            'chair_id' => $reservation->chair_id,
            'barber' => $barber === null ? null : ['id' => $barber->id, 'name' => $barber->name, 'photo_url' => $barber->photo_url],
            'services' => $reservation->lines->map(fn (ReservationLine $line) => [
                'service_id' => $line->service_id,
                'name' => $line->service?->getTranslation('name', $locale),
                'price' => (float) $line->price_at_booking,
                'duration_minutes' => $line->duration_at_booking,
            ])->values(),
            'total_price' => $reservation->totalPrice(),
            'total_duration_minutes' => $reservation->totalDuration(),
            'currency' => $branch->currency->name,
            'position' => $reservation->status->isLive()
                ? QueueProjection::forChair($reservation->chair)->positionOf($reservation)
                : null,
            'created_at' => $reservation->created_at?->toIso8601String(),
            'cancel_at' => $reservation->cancel_at?->toIso8601String(),
            'started_at' => $reservation->started_at?->toIso8601String(),
            'served_at' => $reservation->served_at?->toIso8601String(),
        ];
    }
}
