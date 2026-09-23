<?php

namespace Bltdreeg\Core\Modules\Services\Models;


use Bltdreeg\Core\Modules\Catalog\Models\CatalogServiceCategory;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Services\Database\Factories\ServiceCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['tenant_id', 'catalog_service_category_id', 'name', 'description', 'is_active'])]
class ServiceCategory extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return ServiceCategoryFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function catalog(): BelongsTo
    {
        return $this->belongsTo(CatalogServiceCategory::class, 'catalog_service_category_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'category_id');
    }

    public function isFromCatalog(): bool
    {
        return $this->catalog_service_category_id !== null;
    }
}
