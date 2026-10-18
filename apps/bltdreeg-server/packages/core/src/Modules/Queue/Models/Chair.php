<?php

namespace Bltdreeg\Core\Modules\Queue\Models;

use Bltdreeg\Core\Modules\Queue\Database\Factories\ChairFactory;
use Bltdreeg\Core\Modules\Queue\Enums\ChairStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * كرسي شغل في فرع — الطابور والـ slots ملك الكرسي، والكرسي مربوط بحلاق (feature 1).
 */
class Chair extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected static function newFactory(): ChairFactory
    {
        return ChairFactory::new();
    }

    protected function casts(): array
    {
        return [
            'position_no' => 'integer',
            'status' => ChairStatusEnum::class,
            'toggled_at' => 'datetime',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class)->withoutGlobalScopes();
    }

    public function slots(): HasMany
    {
        return $this->hasMany(Slot::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function dayAssignments(): HasMany
    {
        return $this->hasMany(ChairDayAssignment::class);
    }

    public function isActive(): bool
    {
        return $this->status === ChairStatusEnum::Active;
    }

    /**
     * حلاق الكرسي في يوم معيّن: تعيين اليوم لو موجود، وإلا الحلاق اللي الكرسي ده كرسيه الافتراضي.
     */
    public function barberOn(CarbonInterface $day): ?BarberProfile
    {
        $assignment = $this->dayAssignments()
            ->withoutGlobalScopes()
            ->whereDate('day', $day->toDateString())
            ->with(['barber' => fn ($barber) => $barber->withoutGlobalScopes()])
            ->first();

        if ($assignment !== null) {
            return $assignment->barber?->is_active ? $assignment->barber : null;
        }

        return BarberProfile::query()
            ->withoutGlobalScopes()
            ->where('default_chair_id', $this->id)
            ->where('is_active', true)
            ->first();
    }
}
