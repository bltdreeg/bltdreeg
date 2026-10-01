<?php

namespace App\Modules\V1\Customer\Auth\Otp\Providers;

use App\Modules\V1\Customer\Auth\Otp\Contracts\OtpProvider;
use App\Modules\V1\Customer\Auth\Otp\Data\DeliveryResult;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use Illuminate\Support\Str;

class FakeOtpProvider implements OtpProvider
{
    /** @var array<int, OtpMessage> */
    public array $sentMessages = [];

    protected bool $shouldFail = false;

    protected string $failureReason = 'Simulated provider delivery failure';

    public function setShouldFail(bool $fail = true, string $reason = 'Simulated provider delivery failure'): self
    {
        $this->shouldFail = $fail;
        $this->failureReason = $reason;

        return $this;
    }

    public function send(OtpMessage $message): DeliveryResult
    {
        if ($this->shouldFail) {
            return DeliveryResult::failure($this->failureReason);
        }

        $this->sentMessages[] = $message;

        return DeliveryResult::success('fake_'.Str::random(12));
    }

    public function hasSentTo(string $recipient, ?string $code = null): bool
    {
        foreach ($this->sentMessages as $msg) {
            if ($msg->recipient === $recipient) {
                if ($code === null || $msg->code === $code) {
                    return true;
                }
            }
        }

        return false;
    }

    public function count(): int
    {
        return count($this->sentMessages);
    }

    public function reset(): void
    {
        $this->sentMessages = [];
        $this->shouldFail = false;
    }
}
