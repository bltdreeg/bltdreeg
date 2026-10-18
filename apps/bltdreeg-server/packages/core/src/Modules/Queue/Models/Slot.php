<?php

namespace Bltdreeg\Core\Modules\Queue\Models;

use Bltdreeg\Core\Modules\Queue\Database\Factories\SlotFactory;
use Bltdreeg\Core\Modules\Queue\Enums\ReservationStatusEnum;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ميعاد دخول على كرسي (feature 1): مش appointment — صاحبه بيدخل الطابور لما الميعاد ييجي، ورا اللي في الطابور.
 * day + start_at وقت محلي في مصر؛ التطبيق شغال UTC، فـ startsAt() بيحوّل.
 */
class Slot extends Model
{
    use HasFactory;

    public const TIMEZONE = 'Africa/Cairo';

    protected $guarded = ['id'];

    protected static function newFactory(): SlotFactory
    {
        return SlotFactory::new();
    }

    protected function casts(): array
    {
        return [
            'day' => 'date',
            'capacity' => 'integer',
        ];
    }

    public function chair(): BelongsTo
    {
        return $this->belongsTo(Chair::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /** لحظة البداية بتوقيت UTC */
    public function startsAt(): CarbonImmutable
    {
        return CarbonImmutable::parse($this->day->toDateString().' '.$this->start_at, self::TIMEZONE)->utc();
    }

    /** الحاجزين اللي لسه ماستخدموش الـ slot (محجوز، أو دخلوا بيه الطابور) — اللي اتلغى بيفضّي مكانه */
    public function holdersCount(): int
    {
        return $this->reservations()
            ->whereIn('status', [ReservationStatusEnum::Booked->value, ...ReservationStatusEnum::liveValues()])
            ->count();
    }

    public function remainingCapacity(): int
    {
        return max(0, $this->capacity - $this->holdersCount());
    }

    /**
     * الـ slots اللي بدايتها لسه مجاتش (مقارنة بالوقت المحلي).
     *
     * @param  Builder<Slot>  $query
     * @return Builder<Slot>
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        $local = CarbonImmutable::now(self::TIMEZONE);

        return $query->where(fn (Builder $q) => $q
            ->whereDate('day', '>', $local->toDateString())
            ->orWhere(fn (Builder $today) => $today
                ->whereDate('day', $local->toDateString())
                ->where('start_at', '>', $local->format('H:i:s'))));
    }
}
