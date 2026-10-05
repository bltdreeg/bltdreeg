<?php

namespace App\Modules\V1\Customer\Auth\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'otp_challenge_id',
    'channel',
    'provider',
    'recipient_masked',
    'status',
    'provider_message_id',
    'error',
    'created_at',
])]
class OtpDelivery extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(OtpChallenge::class, 'otp_challenge_id');
    }
}
