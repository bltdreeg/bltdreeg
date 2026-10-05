<?php

namespace App\Modules\V1\Customer\Auth\Otp;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use App\Modules\V1\Customer\Auth\Models\OtpDelivery;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use Throwable;

class OtpDispatcher
{
    public function __construct(
        protected readonly OtpProviderManager $providerManager,
    ) {}

    /**
     * Dispatch an OTP message through the channel's configured providers.
     *
     * @throws CustomerAuthException
     */
    public function dispatch(OtpMessage $message, ?OtpChallenge $challenge = null): OtpDelivery
    {
        $settings = OtpChannelSetting::getCached()
            ->firstWhere('channel', $message->channel->value);

        if (! $settings || ! $settings->is_enabled) {
            throw new CustomerAuthException('auth.channel_unavailable', 422);
        }

        $providers = $settings->providers ?? [];
        if (empty($providers)) {
            throw new CustomerAuthException('auth.delivery_failed', 503);
        }

        $maskedRecipient = $this->maskRecipient($message->recipient, $message->channel);

        foreach ($providers as $providerKey) {
            try {
                $provider = $this->providerManager->driver($providerKey);
                $result = $provider->send($message);

                $delivery = OtpDelivery::create([
                    'otp_challenge_id' => $challenge?->id,
                    'channel' => $message->channel->value,
                    'provider' => $providerKey,
                    'recipient_masked' => $maskedRecipient,
                    'status' => $result->successful ? 'sent' : 'failed',
                    'provider_message_id' => $result->providerMessageId,
                    'error' => $result->error,
                    'created_at' => now(),
                ]);

                if ($result->successful) {
                    return $delivery;
                }
            } catch (Throwable $e) {
                OtpDelivery::create([
                    'otp_challenge_id' => $challenge?->id,
                    'channel' => $message->channel->value,
                    'provider' => $providerKey,
                    'recipient_masked' => $maskedRecipient,
                    'status' => 'failed',
                    'provider_message_id' => null,
                    'error' => $e->getMessage(),
                    'created_at' => now(),
                ]);
            }
        }

        throw new CustomerAuthException('auth.delivery_failed', 503);
    }

    public function maskRecipient(string $recipient, OtpChannelEnum $channel): string
    {
        if ($channel === OtpChannelEnum::Email || str_contains($recipient, '@')) {
            $parts = explode('@', $recipient);
            $name = $parts[0];
            $domain = $parts[1] ?? '';
            if (strlen($name) <= 2) {
                $maskedName = substr($name, 0, 1).'*';
            } else {
                $maskedName = substr($name, 0, 1).str_repeat('*', max(1, strlen($name) - 2)).substr($name, -1);
            }

            return $maskedName.'@'.$domain;
        }

        // Phone number masking: e.g. +201012345678 -> +2010****5678
        $clean = preg_replace('/[^\d+]/', '', $recipient);
        $len = strlen($clean);
        if ($len <= 7) {
            return str_repeat('*', $len);
        }

        $prefix = substr($clean, 0, 5);
        $suffix = substr($clean, -4);

        return $prefix.'****'.$suffix;
    }
}
