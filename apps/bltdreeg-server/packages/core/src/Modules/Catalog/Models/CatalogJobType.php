<?php

namespace Bltdreeg\Core\Modules\Catalog\Models;


use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'is_active', 'is_bookable'])]
class CatalogJobType extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Bltdreeg\Core\Modules\Catalog\Database\Factories\CatalogJobTypeFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_bookable' => 'boolean',
        ];
    }

    public function jobTypes(): HasMany
    {
        return $this->hasMany(JobType::class, 'catalog_job_type_id');
    }
}
