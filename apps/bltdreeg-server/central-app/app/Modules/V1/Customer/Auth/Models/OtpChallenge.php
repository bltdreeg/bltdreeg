<?php

namespace App\Modules\V1\Customer\Auth\Models;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'ulid',
    'identifier',
    'purpose',
    'channel',
    'customer_id',
    'code_hash',
    'attempts',
    'send_count',
    'next_resend_at',
    'expires_at',
    'locked_until',
    'consumed_at',
    'payload',
    'reset_token_hash',
    'reset_token_expires_at',
])]
class OtpChallenge extends Model
{
    use HasFactory;
    use HasUlids;

    public function uniqueIds(): array
    {
        return ['ulid'];
    }

    public function getRouteKeyName(): string
    {
        return 'ulid';
    }

    protected function casts(): array
    {
        return [
            'purpose' => OtpPurposeEnum::class,
            'channel' => OtpChannelEnum::class,
            'attempts' => 'integer',
            'send_count' => 'integer',
            'next_resend_at' => 'datetime',
            'expires_at' => 'datetime',
            'locked_until' => 'datetime',
            'consumed_at' => 'datetime',
            'reset_token_expires_at' => 'datetime',
            'payload' => 'encrypted:array',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(OtpDelivery::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }

    public function canResend(): bool
    {
        return $this->next_resend_at === null || $this->next_resend_at->isPast();
    }
}
