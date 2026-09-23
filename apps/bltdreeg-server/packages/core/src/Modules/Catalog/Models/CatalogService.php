<?php

namespace Bltdreeg\Core\Modules\Catalog\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['catalog_service_category_id', 'name', 'description', 'default_duration', 'default_price', 'is_active'])]
class CatalogService extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Bltdreeg\Core\Modules\Catalog\Database\Factories\CatalogServiceFactory::new();
    }

    protected function casts(): array
    {
        return [
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
