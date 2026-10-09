<?php

namespace Bltdreeg\Core\Modules\Catalog\Models;

use Bltdreeg\Core\Modules\Catalog\Database\Factories\CatalogServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['catalog_service_category_id', 'name', 'description', 'default_duration', 'default_price', 'is_active'])]
#[Translatable('name', 'description')]
class CatalogService extends Model
{
    use HasFactory;
    use HasTranslations;

    protected static function newFactory()
    {
        return CatalogServiceFactory::new();
    }

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'is_active' => 'boolean',
            'default_duration' => 'integer',
            'default_price' => 'decimal:2',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CatalogServiceCategory::class, 'catalog_service_category_id');
    }
}
