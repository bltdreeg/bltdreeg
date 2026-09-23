<?php

namespace Bltdreeg\Core\Modules\Hr\Models;


use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'catalog_job_type_id', 'name', 'description', 'is_active'])]
class JobType extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return \Bltdreeg\Core\Modules\Hr\Database\Factories\JobTypeFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function catalog(): BelongsTo
    {
        return $this->belongsTo(CatalogJobType::class, 'catalog_job_type_id');
    }

    public function isFromCatalog(): bool
    {
        return $this->catalog_job_type_id !== null;
    }
}
