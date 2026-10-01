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
use Illuminate\Support\Facades\DB;

class MeEmailController extends Controller
{
    public function __construct(
        protected readonly OtpService $otpService,
    ) {}

    /**
     * Resend verification code to the customer's pending email.
     */
    public function resend(Request $request): OtpChallengeResource
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if (empty($customer->pending_email)) {
            throw new CustomerAuthException('auth.account_not_found', 422);
        }

        $emailTaken = Customer::query()
            ->where('email', $customer->pending_email)
            ->where('id', '!=', $customer->id)
            ->whereNotNull('email_verified_at')
            ->exists();

        if ($emailTaken) {
            throw new CustomerAuthException('auth.email_taken', 422);
        }

        $challenge = $this->otpService->issue(
            identifier: $customer->pending_email,
            purpose: OtpPurposeEnum::VerifyEmail,
            channel: OtpChannelEnum::Email,
            customer: $customer,
            locale: app()->getLocale(),
        );

        return new OtpChallengeResource($challenge);
    }

    /**
     * Verify OTP code and promote pending email to verified primary email.
     */
    public function verify(EmailVerifyRequest $request): CustomerResource
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if (empty($customer->pending_email)) {
            throw new CustomerAuthException('auth.otp_invalid', 422, ['attemptsLeft' => 0]);
        }

        $code = (string) $request->input('code');
        $this->otpService->verify($customer->pending_email, OtpPurposeEnum::VerifyEmail, $code);

        DB::transaction(function () use ($customer) {
            $emailTaken = Customer::query()
                ->where('email', $customer->pending_email)
                ->where('id', '!=', $customer->id)
                ->whereNotNull('email_verified_at')
                ->lockForUpdate()
                ->exists();

            if ($emailTaken) {
                throw new CustomerAuthException('auth.email_taken', 422);
            }

            $customer->email = $customer->pending_email;
            $customer->email_verified_at = now();
            $customer->pending_email = null;
            $customer->save();
        });

        return new CustomerResource($customer->fresh());
    }
}
