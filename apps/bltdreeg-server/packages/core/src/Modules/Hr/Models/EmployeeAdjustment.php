<?php

namespace Bltdreeg\Core\Modules\Hr\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Hr\Database\Factories\EmployeeAdjustmentFactory;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentTypeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'user_id',
    'type',
    'amount',
    'reason',
    'effective_date',
    'status',
    'approved_by',
    'approved_at',
    'created_by',
])]
class EmployeeAdjustment extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => EmployeeAdjustmentTypeEnum::class,
            'amount' => 'decimal:2',
            'effective_date' => 'date:Y-m-d',
            'status' => EmployeeAdjustmentStatusEnum::class,
            'approved_at' => 'datetime',
        ];
    }

    protected static function newFactory()
    {
        return EmployeeAdjustmentFactory::new();
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

    public function isApproved(): bool
    {
        return $this->approved_at !== null;
    }

    public function isPending(): bool
    {
        return ! $this->isApproved() && $this->status !== EmployeeAdjustmentStatusEnum::CANCELLED;
    }

    public function scopeForEmployee(Builder $query, int|string $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeEffectiveOn(Builder $query, string $date): Builder
    {
        return $query->whereDate('effective_date', $date);
    }
}
