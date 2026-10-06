<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Http\Requests\RegisterRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\OtpChallengeResource;
use App\Modules\V1\Customer\Auth\Otp\OtpService;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function __construct(
        protected readonly OtpService $otpService,
    ) {}

    public function __invoke(RegisterRequest $request): OtpChallengeResource
    {
        $normalizedPhone = (string) PhoneNumber::toE164($request->input('phone'));
        $channel = $request->filled('channel')
            ? OtpChannelEnum::from($request->input('channel'))
            : null;

        $payload = [
            'first_name' => $request->input('first_name'),
            'last_name' => $request->input('last_name'),
            'phone' => $normalizedPhone,
            'password' => Hash::make($request->input('password')),
            'email' => $request->filled('email') ? strtolower(trim((string) $request->input('email'))) : null,
            'accepted_terms' => (bool) $request->input('accepted_terms', false),
        ];

        $challenge = $this->otpService->issue(
            identifier: $normalizedPhone,
            purpose: OtpPurposeEnum::Register,
            channel: $channel,
            customer: null,
            payload: $payload,
            locale: app()->getLocale(),
        );

        return new OtpChallengeResource($challenge);
    }
}
