<?php

namespace Bltdreeg\Core\Modules\Queue\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Queue\Database\Factories\BarberProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * الحلاق زي ما العميل بيشوفه (اسم وصورة) — منفصل عن users (حسابات الموظفين).
 */
class BarberProfile extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected $guarded = ['id'];

    protected static function newFactory(): BarberProfileFactory
    {
        return BarberProfileFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function defaultChair(): BelongsTo
    {
        return $this->belongsTo(Chair::class, 'default_chair_id');
    }
}
