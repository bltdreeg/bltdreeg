<?php

namespace Bltdreeg\Core\Modules\Queue\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Queue\Enums\QueueEventTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * سجل كل اللي حصل للحجز (دخول، إلغاء، بداية الخدمة...) — append only.
 */
class QueueEvent extends Model
{
    use BelongsToTenant;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'type' => QueueEventTypeEnum::class,
            'positions' => 'integer',
            'detail' => 'array',
            'at' => 'datetime',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
