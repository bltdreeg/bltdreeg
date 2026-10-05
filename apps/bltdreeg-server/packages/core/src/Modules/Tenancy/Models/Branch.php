<?php

namespace Bltdreeg\Core\Modules\Tenancy\Models;


use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Geo\Models\GeoArea;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Bltdreeg\Core\Modules\Tenancy\Database\Factories\BranchFactory;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable([
    'tenant_id',
    'name',
    'phone',
    'address',
    'latitude',
    'longitude',
    'governorate_id',
    'city_id',
    'area_id',
    'location_source',
    'team_size',
    'service_location_type',
    'is_active',
])]
#[Translatable('name', 'address')]
class Branch extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;
    use HasTranslations;

    public static function branchScopeColumn(): string
    {
        return 'id';
    }

    protected static function branchAutoAssignOnCreate(): bool
    {
        return false;
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(GeoGovernorate::class, 'governorate_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(GeoCity::class, 'city_id');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(GeoArea::class, 'area_id');
    }

    protected static function newFactory()
    {
        return BranchFactory::new();
    }

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'address' => 'array',
            'is_active' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'location_source' => 'integer',
            'team_size' => TeamSizeEnum::class,
            'service_location_type' => 'array',
        ];
    }

    public function getLocale(): string
    {
        return $this->translationLocale ?? 'ar';
    }
}
