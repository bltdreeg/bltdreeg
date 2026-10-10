<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Concerns\InvalidatesOccupancy;
use Bltdreeg\Core\Modules\Booking\Database\Factories\BookingFactory;
use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
    use InvalidatesOccupancy;

    protected static function newFactory()
    {
        return BookingFactory::new();
    }

    protected function casts(): array
    {
        return [
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

    /**
     * Times are stored UTC (Global Constraints), but a caller naturally has a
     * branch-local CarbonImmutable in hand — the selected slot, "now" for a
     * cancellation. The native `immutable_datetime` cast does not convert on write;
     * it formats whatever offset the instance already carries, so a Cairo 10:30
     * (+02:00) would be stored as the literal string "10:30" and read back as UTC
     * 10:30, two hours off. These accessors normalize to UTC on the way in and
     * resolve back to UTC on the way out, so every caller gets this for free.
     */
    protected function startsAt(): Attribute
    {
        return self::utcDateTime();
    }

    protected function endsAt(): Attribute
    {
        return self::utcDateTime();
    }

    protected function cancelledAt(): Attribute
    {
        return self::utcDateTime();
    }

    private static function utcDateTime(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): ?CarbonImmutable => $value === null ? null : CarbonImmutable::parse($value, 'UTC'),
            set: fn (CarbonInterface|string|null $value): ?string => $value === null
                ? null
                : CarbonImmutable::parse($value)->utc()->format('Y-m-d H:i:s'),
        );
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
