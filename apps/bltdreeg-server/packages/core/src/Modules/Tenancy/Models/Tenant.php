<?php

namespace Bltdreeg\Core\Modules\Tenancy\Models;


use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantLegalDocument;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Database\Factories\TenantFactory;
use Filament\Models\Contracts\HasName;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'name',
    'slug',
    'email',
    'phone',
    'logo',
    'address',
    'currency',
    'is_active',
    'status',
    'website',
    'onboarding_completed_at',
    'terms_accepted_at',
    'privacy_accepted_at',
    'terms_version',
])]
class Tenant extends Model implements HasName
{
    use HasFactory;

    protected static function newFactory()
    {
        return TenantFactory::new();
    }

    protected function casts(): array
    {
        return [
            'currency' => CurrencyEnum::class,
            'is_active' => 'boolean',
            'status' => TenantStatusEnum::class,
            'onboarding_completed_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'privacy_accepted_at' => 'datetime',
        ];
    }

    public function getFilamentName(): string
    {
        return $this->name;
    }

    public function statusIs(TenantStatusEnum $status): bool
    {
        return $this->status === $status;
    }

    public function isApproved(): bool
    {
        return $this->statusIs(TenantStatusEnum::APPROVED);
    }

    public function isVisibleOnMarketplace(): bool
    {
        return $this->isApproved() && $this->is_active;
    }

    public function scopeVisibleOnMarketplace(Builder $query): Builder
    {
        return $query
            ->where('status', TenantStatusEnum::APPROVED->value)
            ->where('is_active', true);
    }

    public function onboardingSubmissions(): HasMany
    {
        return $this->hasMany(TenantOnboardingSubmission::class);
    }

    public function latestOnboardingSubmission(): HasOne
    {
        return $this->hasOne(TenantOnboardingSubmission::class)->latestOfMany('revision');
    }

    public function legalDocuments(): HasMany
    {
        return $this->hasMany(TenantLegalDocument::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tenant_user', 'tenant_id', 'user_id')
            ->using(UserTenant::class)
            ->withPivot(['job_type_id', 'shift_id'])
            ->withTimestamps();
    }

    public function serviceCategories(): HasMany
    {
        return $this->hasMany(ServiceCategory::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function jobTypes(): HasMany
    {
        return $this->hasMany(JobType::class);
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function roles(): HasMany
    {
        return $this->hasMany(Role::class, 'tenant_id');
    }
}
