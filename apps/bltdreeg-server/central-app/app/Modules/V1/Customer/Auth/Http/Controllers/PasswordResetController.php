<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Http\Requests\ForgotPasswordRequest;
use App\Modules\V1\Customer\Auth\Http\Requests\PasswordResetRequest;
use App\Modules\V1\Customer\Auth\Http\Requests\PasswordVerifyRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\AuthSessionResource;
use App\Modules\V1\Customer\Auth\Http\Resources\OtpChallengeResource;
use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use App\Modules\V1\Customer\Auth\Otp\OtpService;
use App\Modules\V1\Customer\Auth\Support\CustomerTokenIssuer;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function __construct(
        protected readonly OtpService $otpService,
        protected readonly CustomerTokenIssuer $tokenIssuer,
    ) {}

    /**
     * Send password reset OTP challenge.
     */
    public function forgot(ForgotPasswordRequest $request): OtpChallengeResource
    {
        $customer = null;
        $identifier = null;

        if ($request->filled('phone')) {
            $identifier = (string) PhoneNumber::toE164($request->input('phone'));
            $customer = Customer::query()->where('phone', $identifier)->first();
        } elseif ($request->filled('email')) {
            $identifier = strtolower(trim((string) $request->input('email')));
            $customer = Customer::query()
                ->where('email', $identifier)
                ->whereNotNull('email_verified_at')
                ->first();
        }

        if (! $customer || ! $identifier) {
            throw new CustomerAuthException('auth.account_not_found', 422);
        }

        if (! $customer->is_active) {
            throw new CustomerAuthException('auth.account_disabled', 403);
        }

        $channel = $request->filled('channel')
            ? OtpChannelEnum::from($request->input('channel'))
            : null;

        $challenge = $this->otpService->issue(
            identifier: $identifier,
            purpose: OtpPurposeEnum::ResetPassword,
            channel: $channel,
            customer: $customer,
            locale: app()->getLocale(),
        );

        return new OtpChallengeResource($challenge);
    }

    /**
     * Verify password reset OTP code and issue a temporary single-use reset token.
     */
    public function verifyCode(PasswordVerifyRequest $request): JsonResponse
    {
        $identifier = $request->filled('phone')
            ? (string) PhoneNumber::toE164($request->input('phone'))
            : strtolower(trim((string) $request->input('email')));

        $code = (string) $request->input('code');

        $challenge = $this->otpService->verify($identifier, OtpPurposeEnum::ResetPassword, $code);

        $resetToken = Str::random(64);
        $challenge->reset_token_hash = hash('sha256', $resetToken);
        $challenge->reset_token_expires_at = now()->addMinutes(10);
        $challenge->save();

        return response()->json([
            'reset_token' => $resetToken,
            'expires_at' => $challenge->reset_token_expires_at->toISOString(),
        ]);
    }

    /**
     * Reset password using the reset token, revoking all existing device tokens.
     */
    public function reset(PasswordResetRequest $request): AuthSessionResource
    {
        $tokenHash = hash('sha256', (string) $request->input('reset_token'));

        $challenge = OtpChallenge::query()
            ->where('reset_token_hash', $tokenHash)
            ->where('reset_token_expires_at', '>', now())
            ->first();

        if (! $challenge) {
            throw new CustomerAuthException('auth.reset_token_invalid', 422);
        }

        // Single-use token: invalidate immediately
        $challenge->reset_token_hash = null;
        $challenge->reset_token_expires_at = null;
        $challenge->save();

        $customer = $challenge->customer;

        if (! $customer) {
            throw new CustomerAuthException('auth.account_not_found', 422);
        }

        if (! $customer->is_active) {
            throw new CustomerAuthException('auth.account_disabled', 403);
        }

        $customer->password = Hash::make($request->input('password'));
        $customer->save();

        // Revoke ALL existing tokens
        $customer->tokens()->delete();

        $platform = $request->header('X-Platform', 'web');
        $deviceName = $request->input('device_name');
        $token = $this->tokenIssuer->issue($customer, $deviceName, $platform);

        return new AuthSessionResource($customer, $token);
    }
}
