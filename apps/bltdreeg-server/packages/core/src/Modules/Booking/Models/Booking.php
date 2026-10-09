<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Database\Factories\BookingFactory;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id', 'branch_id', 'barber_user_id', 'customer_id', 'guest_name', 'guest_phone',
    'source', 'status', 'starts_at', 'ends_at', 'duration_minutes', 'gap_minutes',
    'total_price', 'currency', 'booking_code', 'notes', 'is_forced', 'created_by_user_id',
    'cancelled_at', 'cancelled_by_customer', 'rescheduled_from_id',
])]
class Booking extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return BookingFactory::new();
    }

    protected function casts(): array
    {
        return [
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'cancelled_at' => 'immutable_datetime',
            'duration_minutes' => 'integer',
            'gap_minutes' => 'integer',
            'total_price' => 'decimal:2',
            'currency' => CurrencyEnum::class,
            'status' => BookingStatusEnum::class,
            'source' => BookingSourceEnum::class,
            'is_forced' => 'boolean',
            'cancelled_by_customer' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(User::class, 'barber_user_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    /**
     * How far the booking actually blocks the barber: the appointment plus the gap
     * recorded when it was booked.
     */
    public function footprintEndsAt(): CarbonImmutable
    {
        return $this->ends_at->addMinutes((int) $this->gap_minutes);
    }

    /** Whoever this booking is for, whether an account holder or a walk-in. */
    public function customerLabel(): string
    {
        return $this->customer_id !== null
            ? trim(($this->customer?->first_name ?? '').' '.($this->customer?->last_name ?? '')) ?: (string) $this->customer?->phone
            : (string) $this->guest_name;
    }

    /** Only bookings that still hold their time. */
    public function scopeOccupying(Builder $query): Builder
    {
        return $query->whereIn('status', BookingStatusEnum::occupying());
    }

    public function scopeForBarberOn(Builder $query, int $barberId, CarbonImmutable $localDate): Builder
    {
        return $query
            ->where('barber_user_id', $barberId)
            ->whereBetween('starts_at', [
                $localDate->startOfDay()->utc(),
                $localDate->endOfDay()->utc(),
            ]);
    }
}
