<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Http\Requests\EmailVerifyRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\CustomerResource;
use App\Modules\V1\Customer\Auth\Http\Resources\OtpChallengeResource;
use App\Modules\V1\Customer\Auth\Otp\OtpService;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class MeEmailController extends Controller
{
    public function __construct(
        protected readonly OtpService $otpService,
    ) {}

    /**
     * Resend the verification code to the customer's (unverified) email.
     */
    public function resend(Request $request): OtpChallengeResource
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if (empty($customer->email) || $customer->email_verified_at !== null) {
            throw new CustomerAuthException('auth.account_not_found', 422);
        }

        $challenge = $this->otpService->issue(
            identifier: $customer->email,
            purpose: OtpPurposeEnum::VerifyEmail,
            channel: OtpChannelEnum::Email,
            customer: $customer,
            locale: app()->getLocale(),
        );

        return new OtpChallengeResource($challenge);
    }

    /**
     * Verify the OTP code sent to the customer's email and mark it verified.
     */
    public function verify(EmailVerifyRequest $request): CustomerResource
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if (empty($customer->email) || $customer->email_verified_at !== null) {
            throw new CustomerAuthException('auth.otp_invalid', 422, ['attemptsLeft' => 0]);
        }

        $code = (string) $request->input('code');
        $this->otpService->verify($customer->email, OtpPurposeEnum::VerifyEmail, $code);

        $customer->email_verified_at = now();
        $customer->save();

        return new CustomerResource($customer->fresh());
    }
}
