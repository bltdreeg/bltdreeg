<?php

namespace Bltdreeg\Core\Modules\Queue\Models;

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Queue\Database\Factories\ReservationFactory;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationStatusEnum;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationTypeEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * مكان في طابور كرسي. الترتيب = join_time، والمكان (position) بيتحسب لحظياً ومش متخزن (ADR 0004).
 */
class Reservation extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected static function newFactory(): ReservationFactory
    {
        return ReservationFactory::new();
    }

    protected function casts(): array
    {
        return [
            'type' => ReservationTypeEnum::class,
            'status' => ReservationStatusEnum::class,
            'join_time' => 'datetime',
            'cancel_at' => 'datetime',
            'started_at' => 'datetime',
            'served_at' => 'datetime',
            'postpone_used' => 'boolean',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class)->withoutGlobalScopes();
    }

    public function chair(): BelongsTo
    {
        return $this->belongsTo(Chair::class);
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(Slot::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(ReservationLine::class)->orderBy('line_no');
    }

    public function events(): HasMany
    {
        return $this->hasMany(QueueEvent::class)->withoutGlobalScopes();
    }

    /** مجموع مدد الخدمات وقت الحجز (snapshot) — أساس حساب الانتظار */
    public function totalDuration(): int
    {
        return (int) $this->lines->sum('duration_at_booking');
    }

    public function totalPrice(): float
    {
        return (float) $this->lines->sum('price_at_booking');
    }
}
