<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'phone', 'avatart', 'is_active', 'is_super_admin'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, HasTenants
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_active;
    }

    public function getTenants(Panel $panel): Collection
    {
        if ($this->is_super_admin) {
            return Shop::query()->get();
        }

        return $this->shops;
    }

    public function canAccessTenant(Model $shop): bool
    {
        if ($this->is_super_admin) {
            return true;
        }

        return $this->shops()->whereKey($shop)->exists();
    }

    public function shops(): BelongsToMany
    {
        return $this->belongsToMany(Shop::class, 'shop_user', 'user_id', 'shop_id')
            ->using(UserShop::class)
            ->withPivot('branch_id');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'user_services', 'user_id', 'service_id');
    }

    public function workingHours(): BelongsToMany
    {
        return $this->belongsToMany(UserWorkingHour::class);
    }
}
