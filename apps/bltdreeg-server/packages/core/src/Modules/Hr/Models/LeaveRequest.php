<?php

namespace Bltdreeg\Core\Modules\Hr\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Hr\Database\Factories\LeaveRequestFactory;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestTypeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable([
    'tenant_id',
    'user_id',
    'type',
    'start_date',
    'end_date',
    'reason',
    'status',
    'approved_by',
    'approved_at',
    'created_by',
])]
class LeaveRequest extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => LeaveRequestTypeEnum::class,
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'status' => LeaveRequestStatusEnum::class,
            'approved_at' => 'datetime',
        ];
    }

    protected static function newFactory()
    {
        return LeaveRequestFactory::new();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isPending(): bool
    {
        return $this->status === LeaveRequestStatusEnum::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === LeaveRequestStatusEnum::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === LeaveRequestStatusEnum::REJECTED;
    }

    public function isCancelled(): bool
    {
        return $this->status === LeaveRequestStatusEnum::CANCELLED;
    }

    public function isDecided(): bool
    {
        return ! $this->isPending();
    }

    /**
     * Inclusive day count, so a single-day leave is one day rather than zero.
     */
    public function days(): int
    {
        if (! $this->start_date instanceof Carbon || ! $this->end_date instanceof Carbon) {
            return 0;
        }

        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    public function scopeForUser(Builder $query, int|string $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Records whose window shares at least one day with the given range, which
     * is the overlap test a second request for the same employee has to pass.
     */
    public function scopeOverlapping(Builder $query, string|Carbon $start, string|Carbon $end): Builder
    {
        return $query
            ->whereDate('start_date', '<=', $end instanceof Carbon ? $end->toDateString() : $end)
            ->whereDate('end_date', '>=', $start instanceof Carbon ? $start->toDateString() : $start);
    }
}
