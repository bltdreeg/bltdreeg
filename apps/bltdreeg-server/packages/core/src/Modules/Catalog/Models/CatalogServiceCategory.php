<?php

namespace Bltdreeg\Core\Modules\Catalog\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'is_active'])]
class CatalogServiceCategory extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Bltdreeg\Core\Modules\Catalog\Database\Factories\CatalogServiceCategoryFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function services(): HasMany
    {
        return $this->hasMany(CatalogService::class, 'catalog_service_category_id');
    }
}
