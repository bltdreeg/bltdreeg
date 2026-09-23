<?php

namespace Bltdreeg\Core\Modules\Services\Models;


use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Services\Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['tenant_id', 'category_id', 'catalog_service_id', 'name', 'description', 'duration', 'price', 'is_active'])]
class Service extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected static function newFactory()
    {
        return ServiceFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'price' => 'decimal:2',
            'duration' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function catalog(): BelongsTo
    {
        return $this->belongsTo(CatalogService::class, 'catalog_service_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_services')->withTimestamps();
    }

    public function isFromCatalog(): bool
    {
        return $this->catalog_service_id !== null;
    }
}
