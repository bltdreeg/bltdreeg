<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Http\Requests\UpdateProfileRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\CustomerResource;
use App\Modules\V1\Customer\Auth\Otp\OtpService;
use App\Modules\V1\Customer\Auth\Support\CustomerDeletion;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

class MeController extends Controller
{
    public function __construct(
        protected readonly OtpService $otpService,
    ) {}

    /**
     * Get the authenticated customer's profile.
     */
    public function show(Request $request): CustomerResource
    {
        return new CustomerResource($request->user());
    }

    /**
     * Update customer profile details.
     */
    public function update(UpdateProfileRequest $request): CustomerResource
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if ($request->has('first_name')) {
            $customer->first_name = $request->input('first_name');
        }

        if ($request->has('last_name')) {
            $customer->last_name = $request->input('last_name');
        }

        if ($request->has('birth_date')) {
            $customer->birth_date = $request->input('birth_date');
        }

        if ($request->boolean('accepted_terms') && $customer->terms_accepted_at === null) {
            $customer->terms_accepted_at = now();
            $customer->terms_version = (string) config('customer_auth.terms_version');
        }

        if ($request->has('email')) {
            $newEmail = $request->input('email');

            if ($newEmail === null) {
                $customer->email = null;
                $customer->email_verified_at = null;
                $customer->pending_email = null;
            } else {
                $newEmail = strtolower(trim((string) $newEmail));

                if ($newEmail !== $customer->email) {
                    $emailTaken = Customer::query()
                        ->where('email', $newEmail)
                        ->where('id', '!=', $customer->id)
                        ->whereNotNull('email_verified_at')
                        ->exists();

                    if ($emailTaken) {
                        throw new CustomerAuthException('auth.email_taken', 422);
                    }

                    $customer->pending_email = $newEmail;

                    $this->otpService->issue(
                        identifier: $newEmail,
                        purpose: OtpPurposeEnum::VerifyEmail,
                        channel: OtpChannelEnum::Email,
                        customer: $customer,
                        locale: app()->getLocale(),
                    );
                }
            }
        }

        $customer->save();

        return new CustomerResource($customer->fresh());
    }

    /**
     * Anonymize customer data, revoke tokens, and soft delete the account.
     */
    public function destroy(Request $request): Response
    {
        CustomerDeletion::delete($request->user());

        return response()->noContent();
    }
}
