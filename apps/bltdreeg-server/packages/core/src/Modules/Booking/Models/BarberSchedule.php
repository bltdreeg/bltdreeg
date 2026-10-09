<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Booking\Database\Factories\BarberScheduleFactory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use InvalidArgumentException;

#[Fillable(['tenant_id', 'branch_id', 'user_id', 'weekday', 'start_time', 'end_time', 'is_active'])]
class BarberSchedule extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return BarberScheduleFactory::new();
    }

    protected static function booted(): void
    {
        static::saving(fn (self $schedule) => $schedule->guardWindow());
    }

    protected function casts(): array
    {
        return [
            'weekday' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected function startTime(): Attribute
    {
        return Attribute::make(set: fn (string $value): string => self::normalizeTime($value));
    }

    protected function endTime(): Attribute
    {
        return Attribute::make(set: fn (string $value): string => self::normalizeTime($value));
    }

    public static function normalizeTime(string $value): string
    {
        $timestamp = strtotime($value);

        if ($timestamp === false) {
            throw new InvalidArgumentException("\"{$value}\" is not a time.");
        }

        return date('H:i:s', $timestamp);
    }

    /**
     * A window lives inside one calendar day. A barber working 22:00–02:00 has no
     * representation here, so the save fails loudly rather than storing a window the
     * engine would read as empty.
     */
    private function guardWindow(): void
    {
        if ($this->end_time <= $this->start_time) {
            throw new InvalidArgumentException(
                "end_time must be after start_time; a window crossing midnight must be split into two windows (got {$this->start_time}–{$this->end_time})."
            );
        }

        $clash = static::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $this->branch_id)
            ->where('user_id', $this->user_id)
            ->where('weekday', $this->weekday)
            ->when($this->exists, fn ($query) => $query->whereKeyNot($this->getKey()))
            ->where('start_time', '<', $this->end_time)
            ->where('end_time', '>', $this->start_time)
            ->first();

        if ($clash !== null) {
            throw new InvalidArgumentException(
                "{$this->start_time}–{$this->end_time} overlaps the existing window {$clash->start_time}–{$clash->end_time} on weekday {$this->weekday}."
            );
        }
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
