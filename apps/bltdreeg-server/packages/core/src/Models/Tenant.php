<?php

namespace Bltdreeg\Core\Models;

use Bltdreeg\Core\Enums\CurrencyEnum;
use Database\Factories\TenantFactory;
use Filament\Models\Contracts\HasName;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Models\Role;

#[Fillable([
    'name',
    'slug',
    'email',
    'phone',
    'logo',
    'address',
    'currency',
    'is_active',
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
        ];
    }

    public function getFilamentName(): string
    {
        return $this->name;
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tenant_user', 'tenant_id', 'user_id')
            ->using(UserTenant::class)
            ->withPivot(['job_type_id'])
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
        $roleClass = config('permission.models.role', Role::class);

        return $this->hasMany($roleClass, 'tenant_id');
    }
}
