<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Database\Factories\BarberTimeBlockFactory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'branch_id', 'user_id', 'starts_at', 'ends_at', 'is_full_day', 'reason', 'created_by'])]
class BarberTimeBlock extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return BarberTimeBlockFactory::new();
    }

    protected function casts(): array
    {
        return [
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'is_full_day' => 'boolean',
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
