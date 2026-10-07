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
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable([
    'tenant_id',
    'name',
    'phone',
    'address',
    'latitude',
    'longitude',
    'maps_url',
    'images',
    'cover_image',
    'governorate_id',
    'city_id',
    'area_id',
    'location_source',
    'currency',
    'team_size',
    'service_location_type',
    'is_active',
])]
#[Translatable('name', 'address')]
class Branch extends Model
{
    // Shared outside both apps' storage/ (like TenantLegalDocument::DISK) so central-app,
    // which serves branches to the marketing site, can see what tenant-app uploaded.
    public const IMAGES_DISK = 'branch_images';

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
            'currency' => CurrencyEnum::class,
            'team_size' => TeamSizeEnum::class,
            'service_location_type' => 'array',
            'images' => 'array',
        ];
    }

    /**
     * الفروع اللي تظهر للعملاء على الموقع: الفرع شغال والصالون متوافق عليه وشغال.
     * من غير scopes التينانت/الفرع: الـ API العام مالوش tenant context.
     */
    public function scopePubliclyListed(Builder $query): Builder
    {
        return $query->withoutGlobalScopes(['tenant', 'branch'])
            ->where('branches.is_active', true)
            ->whereHas('tenant', fn (Builder $tenant) => $tenant->visibleOnMarketplace());
    }

    /**
     * يرتّب بالأقرب ويضيف distance_m (بالمتر). MySQL POINT بياخد (lng, lat).
     */
    public function scopeNearestTo(Builder $query, float $lat, float $lng): Builder
    {
        return $query->select('branches.*')
            ->selectRaw('ST_Distance_Sphere(POINT(branches.longitude, branches.latitude), POINT(?, ?)) AS distance_m', [$lng, $lat])
            ->orderBy('distance_m')
            ->orderBy('branches.id');
    }

    public function coverImageUrl(): ?string
    {
        if ($this->cover_image === null) {
            return null;
        }

        /** @var \Illuminate\Contracts\Filesystem\Cloud $disk */
        $disk = Storage::disk(self::IMAGES_DISK);

        return $disk->url($this->cover_image);
    }

    public function getLocale(): string
    {
        return $this->translationLocale ?? 'ar';
    }
}
