<?php

namespace Bltdreeg\Core\Modules\Services\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * اختلاف فرع عن خدمة الصالون (ADR 0003): price/duration فاضيين = زي الصالون، is_active=false = الفرع مبيقدمهاش.
 * القيم الفعلية بتتقري من BranchCatalog بس.
 */
class BranchService extends Model
{
    use BelongsToTenant;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
