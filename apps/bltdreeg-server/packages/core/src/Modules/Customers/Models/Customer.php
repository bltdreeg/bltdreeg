<?php

namespace Bltdreeg\Core\Modules\Customers\Models;

use App\Modules\V1\Customer\Auth\Models\CustomerSocialAccount;
use Bltdreeg\Core\Modules\Customers\Database\Factories\CustomerFactory;
use Bltdreeg\Core\Modules\Geo\Models\GeoCity;
use Bltdreeg\Core\Modules\Geo\Models\GeoGovernorate;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'ulid',
    'first_name',
    'last_name',
    'phone',
    'phone_verified_at',
    'email',
    'email_verified_at',
    'password',
    'birth_date',
    'last_lat',
    'last_lng',
    'location_source',
    'location_updated_at',
    'governorate_id',
    'city_id',
    'location_confirmed_at',
    'terms_accepted_at',
    'terms_version',
    'locale',
    'is_active',
    'phone_tombstone_hash',
])]
#[Hidden(['password', 'remember_token'])]
class Customer extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use HasUlids;
    use Notifiable;
    use SoftDeletes;

    /**
     * Use the 'ulid' column for ULID generation instead of the bigint PK.
     */
    public function uniqueIds(): array
    {
        return ['ulid'];
    }

    public function getRouteKeyName(): string
    {
        return 'ulid';
    }

    protected static function newFactory(): CustomerFactory
    {
        return CustomerFactory::new();
    }

    protected function casts(): array
    {
        return [
            'phone_verified_at' => 'datetime',
            'email_verified_at' => 'datetime',
            'location_updated_at' => 'datetime',
            'location_confirmed_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'birth_date' => 'date',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_lat' => 'float',
            'last_lng' => 'float',
            'location_source' => 'integer',
        ];
    }

    public function getNameAttribute(): string
    {
        $fullName = trim("{$this->first_name} {$this->last_name}");

        return $fullName !== '' ? $fullName : ($this->phone ?? '');
    }

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(GeoGovernorate::class, 'governorate_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(GeoCity::class, 'city_id');
    }

    public function socialAccounts(): HasMany
    {
        $class = class_exists(CustomerSocialAccount::class)
            ? CustomerSocialAccount::class
            : 'App\\Modules\\V1\\Customer\\Auth\\Models\\CustomerSocialAccount';

        return $this->hasMany($class);
    }
}
