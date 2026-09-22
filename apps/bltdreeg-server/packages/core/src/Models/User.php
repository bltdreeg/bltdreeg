<?php

namespace Bltdreeg\Core\Models;

use Bltdreeg\Core\Concerns\HasTenants;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasTenants as FilamentHasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'phone', 'avatar', 'is_active', 'is_super_admin', 'branch_id', 'start_date', 'salary_type', 'salary'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentHasTenants, FilamentUser
{
    use HasFactory;
    use HasRoles;
    use HasTenants;
    use Notifiable;

    protected static function newFactory()
    {
        return UserFactory::new();
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_super_admin' => 'boolean',
            'start_date' => 'date',
            'salary' => 'decimal:2',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        if (! $this->is_active) {
            return false;
        }

        return $panel->getId() === 'admin'
            ? (bool) $this->is_super_admin
            : ((bool) $this->is_super_admin || $this->tenants()->exists());
    }

    public function getTenants(Panel $panel): Collection
    {
        if ($this->is_super_admin) {
            return Tenant::query()->get();
        }

        return $this->tenants;
    }

    public function canAccessTenant(Model $tenant): bool
    {
        if (! $tenant instanceof Tenant) {
            return false;
        }

        if ($this->is_super_admin) {
            return true;
        }

        return $this->belongsToTenant($tenant);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'user_services')->withTimestamps();
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(EmployeeAttendance::class);
    }
}
