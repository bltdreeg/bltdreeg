<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Concerns\InvalidatesOccupancy;
use Bltdreeg\Core\Modules\Booking\Database\Factories\BarberTimeBlockFactory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'branch_id', 'user_id', 'starts_at', 'ends_at', 'is_full_day', 'reason', 'created_by'])]
class BarberTimeBlock extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;
    use InvalidatesOccupancy;

    protected static function newFactory()
    {
        return BarberTimeBlockFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_full_day' => 'boolean',
        ];
    }

    /**
     * Times are stored UTC (Global Constraints); see Booking's same accessors for
     * why the native immutable_datetime cast cannot be trusted to convert on write.
     */
    protected function startsAt(): Attribute
    {
        return self::utcDateTime();
    }

    protected function endsAt(): Attribute
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
        return $this->belongsTo(User::class, 'user_id');
    }
}
