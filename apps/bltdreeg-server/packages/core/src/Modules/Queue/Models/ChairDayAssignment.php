<?php

namespace Bltdreeg\Core\Modules\Queue\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * مين قاعد على الكرسي يوم معيّن — بيغلب default_chair_id بتاع الحلاق.
 */
class ChairDayAssignment extends Model
{
    use BelongsToTenant;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'day' => 'date',
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
        ];
    }

    public function chair(): BelongsTo
    {
        return $this->belongsTo(Chair::class);
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(BarberProfile::class, 'barber_profile_id');
    }
}
