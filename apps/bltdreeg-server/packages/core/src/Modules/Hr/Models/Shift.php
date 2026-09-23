<?php

namespace Bltdreeg\Core\Modules\Hr\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Hr\Database\Factories\ShiftFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id',
    'name',
    'start_time',
    'end_time',
    'break_minutes',
    'is_active',
])]
class Shift extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return ShiftFactory::new();
    }

    protected function casts(): array
    {
        return [
            'start_time' => 'string',
            'end_time' => 'string',
            'break_minutes' => 'int',
            'is_active' => 'boolean',
        ];
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(EmployeeAttendance::class);
    }
}