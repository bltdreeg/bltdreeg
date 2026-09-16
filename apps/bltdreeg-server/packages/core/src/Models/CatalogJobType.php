<?php

namespace Bltdreeg\Core\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'is_active'])]
class CatalogJobType extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Bltdreeg\Core\Database\Factories\CatalogJobTypeFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function jobTypes(): HasMany
    {
        return $this->hasMany(JobType::class, 'catalog_job_type_id');
    }
}
