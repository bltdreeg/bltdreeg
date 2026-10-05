<?php

namespace App\Modules\V1\Customer\Auth\Otp;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use App\Modules\V1\Customer\Auth\Otp\Jobs\SendOtpDeliveryJob;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Support\Facades\Hash;

class OtpService
{
    public const CODE_LENGTH = 6;

    public const EXPIRY_MINUTES = 5;

    public const MAX_ATTEMPTS = 5;

    public const LOCK_MINUTES = 15;

    public const MAX_HOURLY_SENDS = 5;

    public function __construct(
        protected readonly OtpDispatcher $dispatcher,
    ) {}

    /**
     * Issue a new OTP challenge. Replaces any existing open challenge for the (identifier, purpose).
     */
    public function issue(
        string $identifier,
        OtpPurposeEnum $purpose,
        ?OtpChannelEnum $channel = null,
        ?Customer $customer = null,
        array $payload = [],
        string $locale = 'ar',
    ): OtpChallenge {
        $channel = $this->resolveChannel($channel, $purpose);
        $this->ensureWithinHourlyLimit($identifier);

        // Check for existing open challenge
        $existing = OtpChallenge::query()
            ->where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->first();

        if ($existing && $existing->isLocked()) {
            $lockMinutes = max(1, (int) ceil(now()->diffInSeconds($existing->locked_until) / 60));
            throw new CustomerAuthException('auth.otp_locked', 422, ['lockMinutes' => $lockMinutes]);
        }

        // Delete previous open challenges for this identifier & purpose
        if ($existing) {
            $existing->delete();
        }

        $code = $this->generateCode();
        $codeHash = Hash::make($code);

        $challenge = OtpChallenge::create([
            'identifier' => $identifier,
            'purpose' => $purpose,
            'channel' => $channel,
            'customer_id' => $customer?->id,
            'code_hash' => $codeHash,
            'attempts' => 0,
            'send_count' => 1,
            'next_resend_at' => now()->addSeconds(60),
            'expires_at' => now()->addMinutes(self::EXPIRY_MINUTES),
            'locked_until' => null,
            'consumed_at' => null,
            'payload' => ! empty($payload) ? $payload : null,
        ]);

        SendOtpDeliveryJob::dispatch(
            new OtpMessage(
                recipient: $identifier,
                code: $code,
                purpose: $purpose,
                locale: $locale,
                channel: $channel,
            ),
            $challenge->id,
        );

        return $challenge;
    }

    /**
     * Resend an OTP challenge with exponential cooldown backoff.
     */
    public function resend(
        OtpChallenge $challenge,
        ?OtpChannelEnum $channel = null,
        string $locale = 'ar',
    ): OtpChallenge {
        if ($challenge->isConsumed()) {
            throw new CustomerAuthException('auth.otp_expired', 422);
        }

        if ($challenge->isLocked()) {
            $lockMinutes = max(1, (int) ceil(now()->diffInSeconds($challenge->locked_until) / 60));
            throw new CustomerAuthException('auth.otp_locked', 422, ['lockMinutes' => $lockMinutes]);
        }

        if (! $challenge->canResend()) {
            $retryAfterSeconds = max(1, (int) now()->diffInSeconds($challenge->next_resend_at, false));
            throw new CustomerAuthException('auth.otp_resend_too_soon', 422, [
                'retryAfterSeconds' => $retryAfterSeconds,
            ]);
        }

        $this->ensureWithinHourlyLimit($challenge->identifier);

        if ($channel !== null) {
            $challenge->channel = $channel;
        }

        $code = $this->generateCode();
        $challenge->code_hash = Hash::make($code);
        $challenge->send_count += 1;

        $cooldownSeconds = match ($challenge->send_count) {
            1 => 60,
            2 => 120,
            default => 300,
        };

        $challenge->next_resend_at = now()->addSeconds($cooldownSeconds);
        $challenge->expires_at = now()->addMinutes(self::EXPIRY_MINUTES);
        $challenge->save();

        SendOtpDeliveryJob::dispatch(
            new OtpMessage(
                recipient: $challenge->identifier,
                code: $code,
                purpose: $challenge->purpose,
                locale: $locale,
                channel: $challenge->channel,
            ),
            $challenge->id,
        );

        return $challenge;
    }

    /**
     * Verify an OTP challenge code.
     */
    public function verify(
        string $identifier,
        OtpPurposeEnum $purpose,
        string $code,
    ): OtpChallenge {
        $challenge = OtpChallenge::query()
            ->where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (! $challenge) {
            throw new CustomerAuthException('auth.otp_invalid', 422, ['attemptsLeft' => 0]);
        }

        if ($challenge->isLocked()) {
            $lockMinutes = max(1, (int) ceil(now()->diffInSeconds($challenge->locked_until) / 60));
            throw new CustomerAuthException('auth.otp_locked', 422, ['lockMinutes' => $lockMinutes]);
        }

        if ($challenge->isExpired()) {
            throw new CustomerAuthException('auth.otp_expired', 422);
        }

        if (! Hash::check($code, $challenge->code_hash)) {
            $challenge->attempts += 1;

            if ($challenge->attempts >= self::MAX_ATTEMPTS) {
                $challenge->locked_until = now()->addMinutes(self::LOCK_MINUTES);
                $challenge->save();

                throw new CustomerAuthException('auth.otp_locked', 422, [
                    'lockMinutes' => self::LOCK_MINUTES,
                ]);
            }

            $challenge->save();

            $attemptsLeft = self::MAX_ATTEMPTS - $challenge->attempts;
            throw new CustomerAuthException('auth.otp_invalid', 422, [
                'attemptsLeft' => $attemptsLeft,
            ]);
        }

        $challenge->consumed_at = now();
        $challenge->save();

        return $challenge;
    }

    /**
     * Ensure total sends per identifier in the rolling hour does not exceed limit.
     */
    protected function ensureWithinHourlyLimit(string $identifier): void
    {
        $oneHourAgo = now()->subHour();

        $totalSends = (int) OtpChallenge::query()
            ->where('identifier', $identifier)
            ->where('created_at', '>=', $oneHourAgo)
            ->sum('send_count');

        if ($totalSends >= self::MAX_HOURLY_SENDS) {
            $earliest = OtpChallenge::query()
                ->where('identifier', $identifier)
                ->where('created_at', '>=', $oneHourAgo)
                ->oldest('created_at')
                ->first();

            $retryAfterSeconds = $earliest
                ? max(1, (int) now()->diffInSeconds($earliest->created_at->addHour()))
                : 3600;

            throw new CustomerAuthException('auth.otp_send_limit', 429, [
                'retryAfterSeconds' => $retryAfterSeconds,
            ]);
        }
    }

    /**
     * Generate OTP code, supporting fixed code in dev/testing.
     */
    public function generateCode(): string
    {
        if (app()->environment('local', 'testing')) {
            $fixed = config('customer_auth.otp.fixed_code', env('OTP_FIXED_CODE'));
            if (! empty($fixed)) {
                return (string) $fixed;
            }
        }

        return sprintf('%06d', random_int(0, 999999));
    }

    /**
     * Resolve default channel if not provided.
     */
    public function resolveChannel(?OtpChannelEnum $channel, OtpPurposeEnum $purpose): OtpChannelEnum
    {
        if ($purpose === OtpPurposeEnum::VerifyEmail) {
            return OtpChannelEnum::Email;
        }

        if ($channel !== null) {
            return $channel;
        }

        // Default to first enabled phone channel by sort
        $setting = OtpChannelSetting::getCached()
            ->where('is_enabled', true)
            ->sortBy('sort')
            ->first(fn ($s) => in_array($s->channel, ['sms', 'whatsapp']));

        if ($setting) {
            return OtpChannelEnum::from($setting->channel);
        }

        return OtpChannelEnum::Sms;
    }
}
