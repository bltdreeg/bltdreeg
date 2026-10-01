<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Http\Requests\MePhoneVerifyRequest;
use App\Modules\V1\Customer\Auth\Http\Requests\PhoneVerifyRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\AuthSessionResource;
use App\Modules\V1\Customer\Auth\Http\Resources\OtpChallengeResource;
use App\Modules\V1\Customer\Auth\Models\CustomerSocialAccount;
use App\Modules\V1\Customer\Auth\Otp\OtpService;
use App\Modules\V1\Customer\Auth\Support\CustomerTokenIssuer;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class MePhoneController extends Controller
{
    public function __construct(
        protected readonly OtpService $otpService,
        protected readonly CustomerTokenIssuer $tokenIssuer,
    ) {}

    /**
     * Send OTP to verify or change customer's phone.
     */
    public function send(PhoneVerifyRequest $request): OtpChallengeResource
    {
        $normalizedPhone = (string) PhoneNumber::toE164($request->input('phone'));
        /** @var Customer $customer */
        $customer = $request->user();

        $existingOwner = Customer::query()->where('phone', $normalizedPhone)->first();

        if ($existingOwner && $existingOwner->id !== $customer->id) {
            // If the current customer already has a phone, they cannot take an existing phone
            if ($customer->phone !== null) {
                throw new CustomerAuthException('auth.phone_taken', 422);
            }
            // If customer has no phone (social onboarding), OTP is allowed to prove ownership and merge
        }

        $channel = $request->filled('channel')
            ? OtpChannelEnum::from($request->input('channel'))
            : null;

        $challenge = $this->otpService->issue(
            identifier: $normalizedPhone,
            purpose: OtpPurposeEnum::VerifyPhone,
            channel: $channel,
            customer: $customer,
            locale: app()->getLocale(),
        );

        return new OtpChallengeResource($challenge);
    }

    /**
     * Verify phone OTP. Handles both regular phone verification and social onboarding account merge.
     */
    public function verify(MePhoneVerifyRequest $request): AuthSessionResource
    {
        $normalizedPhone = (string) PhoneNumber::toE164($request->input('phone'));
        $code = (string) $request->input('code');
        /** @var Customer $customer */
        $customer = $request->user();

        $this->otpService->verify($normalizedPhone, OtpPurposeEnum::VerifyPhone, $code);

        $platform = $request->header('X-Platform', 'web');
        $deviceName = $request->input('device_name');

        $existingOwner = Customer::query()->where('phone', $normalizedPhone)->first();

        // Case 1: Phone belongs to another account B
        if ($existingOwner && $existingOwner->id !== $customer->id) {
            if ($customer->phone !== null) {
                throw new CustomerAuthException('auth.phone_taken', 422);
            }

            // Incomplete social customer merges into existing account B
            $callerSocials = CustomerSocialAccount::query()
                ->where('customer_id', $customer->id)
                ->get();

            // Check if B already has an account for the same provider
            foreach ($callerSocials as $callerSocial) {
                $conflict = CustomerSocialAccount::query()
                    ->where('customer_id', $existingOwner->id)
                    ->where('provider', $callerSocial->provider)
                    ->exists();

                if ($conflict) {
                    throw new CustomerAuthException('auth.social_conflict', 409, [
                        'provider' => $callerSocial->provider->slug(),
                    ]);
                }
            }

            // Merge transaction
            $token = DB::transaction(function () use ($customer, $existingOwner, $deviceName, $platform) {
                CustomerSocialAccount::query()
                    ->where('customer_id', $customer->id)
                    ->update(['customer_id' => $existingOwner->id]);

                $customer->tokens()->delete();
                $customer->forceDelete();

                return $this->tokenIssuer->issue($existingOwner, $deviceName, $platform);
            });

            return new AuthSessionResource($existingOwner->fresh(), $token);
        }

        // Case 2: Phone is free or belongs to caller
        $token = DB::transaction(function () use ($customer, $normalizedPhone, $deviceName, $platform) {
            $customer->phone = $normalizedPhone;
            $customer->phone_verified_at = now();
            $customer->save();

            return $this->tokenIssuer->issue($customer, $deviceName, $platform);
        });

        return new AuthSessionResource($customer->fresh(), $token);
    }
}
