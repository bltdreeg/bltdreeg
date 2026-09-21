<?php

namespace Bltdreeg\Core\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Database\Factories\EmployeeAttendanceFactory;
use Bltdreeg\Core\Enums\AttendenceStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'user_id',
    'branch_id',
    'shift_id',
    'date',
    'check_in',
    'check_out',
    'worked_minutes',
    'late_minutes',
    'overtime_minutes',
    'status',
    'notes'
])]
class EmployeeAttendance extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'check_in' => 'datetime',
            'check_out' => 'datetime',
            'worked_minutes' => 'int',
            'late_minutes' => 'int',
            'overtime_minutes' => 'int',
            'status' => AttendenceStatusEnum::class
        ];
    }

    protected static function newFactory()
    {
        return EmployeeAttendanceFactory::new();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function isCheckedIn(): bool
    {
        return $this->check_in !== null;
    }

    public function isCheckedOut(): bool
    {
        return $this->check_out !== null;
    }

    public function isToday(): bool
    {
        return $this->date !== null && $this->date->isToday();
    }

    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->where('date', $date);
    }
}
