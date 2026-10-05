<?php

namespace App\Modules\V1\Customer\Auth\Http\Resources;

use App\Modules\V1\Customer\Auth\Otp\OtpService;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OtpChallengeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isEmail = str_contains($this->resource->identifier, '@');
        $identifierKey = $isEmail ? 'email' : 'phone';
        $identifierValue = $isEmail
            ? $this->resource->identifier
            : (PhoneNumber::toLocal($this->resource->identifier) ?? $this->resource->identifier);

        $attemptsLeft = max(0, OtpService::MAX_ATTEMPTS - (int) $this->resource->attempts);

        return [
            $identifierKey => $identifierValue,
            'purpose' => $this->resource->purpose->value,
            'channel' => $this->resource->channel->value,
            'code_length' => OtpService::CODE_LENGTH,
            'expires_at' => $this->resource->expires_at?->toISOString(),
            'resend_available_at' => $this->resource->next_resend_at?->toISOString(),
            'attempts_left' => $attemptsLeft,
        ];
    }
}
