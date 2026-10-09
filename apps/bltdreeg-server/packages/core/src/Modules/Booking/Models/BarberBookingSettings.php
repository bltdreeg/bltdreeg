<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'branch_id', 'user_id', 'slot_step_minutes', 'gap_minutes', 'is_paused', 'max_days_ahead', 'min_notice_minutes'])]
class BarberBookingSettings extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;

    protected $table = 'barber_booking_settings';

    protected function casts(): array
    {
        return [
            'slot_step_minutes' => 'integer',
            'gap_minutes' => 'integer',
            'is_paused' => 'boolean',
            'max_days_ahead' => 'integer',
            'min_notice_minutes' => 'integer',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
