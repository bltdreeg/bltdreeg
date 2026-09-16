<?php

namespace App\Models;

use App\Enums\WeekDaysEnum;
use Database\Factories\StaffWorkingHourFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'shop_id',
    'branch_id',
    'user_id',
    'day_of_week',
    'start_time',
    'end_time',
    'is_off',
])]
class UserWorkingHour extends Model
{
    /** @use HasFactory<StaffWorkingHourFactory> */
    use HasFactory;

    protected $table = 'user_working_hours';

    public function casts()
    {
        return [
            'day_of_week' => WeekDaysEnum::class,
            'is_off' => 'boolean',
            'start_time' => 'time',
            'end_time' => 'time',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
