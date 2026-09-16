<?php

namespace App\Models;

use App\Enums\WeekDaysEnum;
use Database\Factories\WorkingHourFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'shop_id',
    'branch_id',
    'day_of_week',
    'opening_time',
    'closing_time',
    'is_closed',
])]
class WorkingHour extends Model
{
    /** @use HasFactory<WorkingHourFactory> */
    use HasFactory;

    protected function casts()
    {
        return [
            'day_of_week' => WeekDaysEnum::class,
            'opening_time' => 'time',
            'closing_time' => 'time',
            'is_closed' => 'boolean',
        ];
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
