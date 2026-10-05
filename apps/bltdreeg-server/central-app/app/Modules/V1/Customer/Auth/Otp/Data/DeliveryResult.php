<?php

namespace App\Modules\V1\Customer\Auth\Otp\Data;

class DeliveryResult
{
    public function __construct(
        public readonly bool $successful,
        public readonly ?string $providerMessageId = null,
        public readonly ?string $error = null,
    ) {}

    public static function success(?string $providerMessageId = null): self
    {
        return new self(
            successful: true,
            providerMessageId: $providerMessageId,
        );
    }

    public static function failure(string $error): self
    {
        return new self(
            successful: false,
            error: $error,
        );
    }
}
