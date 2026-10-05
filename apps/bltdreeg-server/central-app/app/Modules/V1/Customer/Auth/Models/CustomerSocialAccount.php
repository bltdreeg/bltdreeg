<?php

namespace App\Modules\V1\Customer\Auth\Models;

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'customer_id',
    'provider',
    'provider_user_id',
    'email',
])]
class CustomerSocialAccount extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'provider' => SocialProviderEnum::class,
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
