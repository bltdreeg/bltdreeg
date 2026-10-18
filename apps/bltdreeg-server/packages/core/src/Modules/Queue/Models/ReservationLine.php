<?php

namespace Bltdreeg\Core\Modules\Queue\Models;

use Bltdreeg\Core\Modules\Services\Models\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * خدمة في الحجز بسعرها ومدتها وقت الحجز — تغيير الأسعار بعدين ميأثرش على الحجوزات القائمة.
 */
class ReservationLine extends Model
{
    public const ITEM_SERVICE = 'service';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'line_no' => 'integer',
            'price_at_booking' => 'decimal:2',
            'duration_at_booking' => 'integer',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class)->withoutGlobalScopes();
    }
}
