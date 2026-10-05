<?php

namespace App\Modules\V1\Customer\Auth\Otp\Jobs;

use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use App\Modules\V1\Customer\Auth\Otp\OtpDispatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendOtpDeliveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(
        public readonly OtpMessage $message,
        public readonly ?int $challengeId = null,
    ) {
        $this->onQueue('otp');
    }

    /**
     * Execute the job in the isolated queue worker.
     */
    public function handle(OtpDispatcher $dispatcher): void
    {
        $challenge = $this->challengeId
            ? OtpChallenge::find($this->challengeId)
            : null;

        // If the challenge was already consumed, skip delivery
        if ($challenge && $challenge->isConsumed()) {
            return;
        }

        $dispatcher->dispatch($this->message, $challenge);
    }
}
