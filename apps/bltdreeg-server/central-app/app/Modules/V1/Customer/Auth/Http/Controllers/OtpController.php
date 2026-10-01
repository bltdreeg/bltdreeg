<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Http\Requests\OtpRequest;
use App\Modules\V1\Customer\Auth\Http\Requests\OtpResendRequest;
use App\Modules\V1\Customer\Auth\Http\Requests\OtpVerifyRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\AuthSessionResource;
use App\Modules\V1\Customer\Auth\Http\Resources\OtpChallengeResource;
use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use App\Modules\V1\Customer\Auth\Otp\OtpService;
use App\Modules\V1\Customer\Auth\Support\CustomerTokenIssuer;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Throwable;

class OtpController extends Controller
{
    public function __construct(
        protected readonly OtpService $otpService,
        protected readonly CustomerTokenIssuer $tokenIssuer,
    ) {}

    /**
     * Send OTP for phone-based login.
     */
    public function send(OtpRequest $request): OtpChallengeResource
    {
        $normalizedPhone = (string) PhoneNumber::toE164($request->input('phone'));
        $customer = Customer::query()->where('phone', $normalizedPhone)->first();

        if (! $customer) {
            throw new CustomerAuthException('auth.phone_not_registered', 422);
        }

        if (! $customer->is_active) {
            throw new CustomerAuthException('auth.account_disabled', 403);
        }

        $channel = $request->filled('channel')
            ? OtpChannelEnum::from($request->input('channel'))
            : null;

        $challenge = $this->otpService->issue(
            identifier: $normalizedPhone,
            purpose: OtpPurposeEnum::Login,
            channel: $channel,
            customer: $customer,
            locale: app()->getLocale(),
        );

        return new OtpChallengeResource($challenge);
    }

    /**
     * Resend an OTP challenge for register, login, or reset_password.
     */
    public function resend(OtpResendRequest $request): OtpChallengeResource
    {
        $identifier = $request->filled('phone')
            ? (string) PhoneNumber::toE164($request->input('phone'))
            : strtolower(trim((string) $request->input('email')));

        $purpose = OtpPurposeEnum::from($request->input('purpose'));

        $challenge = OtpChallenge::query()
            ->where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (! $challenge) {
            throw new CustomerAuthException('auth.otp_expired', 422);
        }

        $channel = $request->filled('channel')
            ? OtpChannelEnum::from($request->input('channel'))
            : null;

        $challenge = $this->otpService->resend($challenge, $channel, app()->getLocale());

        return new OtpChallengeResource($challenge);
    }

    /**
     * Verify an OTP challenge code and return an AuthSession.
     */
    public function verify(OtpVerifyRequest $request): AuthSessionResource
    {
        $normalizedPhone = (string) PhoneNumber::toE164($request->input('phone'));
        $purpose = OtpPurposeEnum::from($request->input('purpose'));
        $code = (string) $request->input('code');

        $challenge = $this->otpService->verify($normalizedPhone, $purpose, $code);

        $platform = $request->header('X-Platform', 'web');
        $deviceName = $request->input('device_name');

        if ($purpose === OtpPurposeEnum::Login) {
            $customer = Customer::query()->where('phone', $normalizedPhone)->first();

            if (! $customer) {
                throw new CustomerAuthException('auth.account_not_found', 422);
            }

            if (! $customer->is_active) {
                throw new CustomerAuthException('auth.account_disabled', 403);
            }

            $token = $this->tokenIssuer->issue($customer, $deviceName, $platform);

            return new AuthSessionResource($customer, $token);
        }

        // Register purpose
        $customer = DB::transaction(function () use ($challenge, $normalizedPhone) {
            $payload = $challenge->payload ?? [];

            if (empty($payload)) {
                throw new CustomerAuthException('auth.otp_expired', 422);
            }

            if (Customer::query()->where('phone', $normalizedPhone)->lockForUpdate()->exists()) {
                throw new CustomerAuthException('auth.phone_taken', 422);
            }

            return Customer::create([
                'first_name' => $payload['first_name'] ?? null,
                'last_name' => $payload['last_name'] ?? null,
                'phone' => $normalizedPhone,
                'phone_verified_at' => now(),
                'password' => $payload['password'] ?? null,
                'pending_email' => $payload['email'] ?? null,
                'terms_accepted_at' => ! empty($payload['accepted_terms']) ? now() : null,
                'terms_version' => ! empty($payload['accepted_terms']) ? config('customer_auth.terms_version') : null,
                'is_active' => true,
                'locale' => app()->getLocale(),
            ]);
        });

        if ($customer->pending_email) {
            try {
                $this->otpService->issue(
                    identifier: $customer->pending_email,
                    purpose: OtpPurposeEnum::VerifyEmail,
                    channel: OtpChannelEnum::Email,
                    customer: $customer,
                    locale: app()->getLocale(),
                );
            } catch (Throwable) {
                // Non-blocking for registration flow
            }
        }

        $token = $this->tokenIssuer->issue($customer, $deviceName, $platform);

        return new AuthSessionResource($customer, $token);
    }
}
