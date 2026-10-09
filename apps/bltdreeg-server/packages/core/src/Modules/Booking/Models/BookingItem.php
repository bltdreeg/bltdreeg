<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Modules\Services\Models\Service;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['booking_id', 'service_id', 'package_id', 'name_snapshot', 'price_snapshot', 'duration_snapshot', 'sort'])]
class BookingItem extends Model
{
    protected function casts(): array
    {
        return [
            'name_snapshot' => 'array',
            'price_snapshot' => 'decimal:2',
            'duration_snapshot' => 'integer',
            'sort' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
