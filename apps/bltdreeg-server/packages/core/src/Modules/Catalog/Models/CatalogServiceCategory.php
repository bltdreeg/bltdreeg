<?php

namespace Bltdreeg\Core\Modules\Catalog\Models;

use Bltdreeg\Core\Modules\Catalog\Database\Factories\CatalogServiceCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['name', 'description', 'is_active'])]
#[Translatable('name', 'description')]
class CatalogServiceCategory extends Model
{
    use HasFactory;
    use HasTranslations;

    protected static function newFactory()
    {
        return CatalogServiceCategoryFactory::new();
    }

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function services(): HasMany
    {
        return $this->hasMany(CatalogService::class, 'catalog_service_category_id');
    }
}
