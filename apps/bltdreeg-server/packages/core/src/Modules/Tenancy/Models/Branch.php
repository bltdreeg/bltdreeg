<?php

namespace Bltdreeg\Core\Modules\Tenancy\Models;


use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Tenancy\Database\Factories\BranchFactory;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'team_size' => TeamSizeEnum::class,
            'service_location_type' => 'array',
        ];
    }

    public function getLocale(): string
    {
        return $this->translationLocale ?? 'ar';
    }
}
