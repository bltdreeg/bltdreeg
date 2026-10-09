<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Http\Requests\SocialLoginRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\AuthSessionResource;
use App\Modules\V1\Customer\Auth\Social\SocialAuthService;
use App\Modules\V1\Customer\Auth\Support\CustomerTokenIssuer;
use Illuminate\Routing\Controller;

class SocialLoginController extends Controller
{
    public function __construct(
        protected readonly SocialAuthService $socialAuthService,
        protected readonly CustomerTokenIssuer $tokenIssuer,
    ) {}

    public function __invoke(SocialLoginRequest $request, string $provider): AuthSessionResource
    {
        $providerEnum = SocialProviderEnum::tryFromSlug($provider);

        if (! $providerEnum) {
            throw new CustomerAuthException('auth.provider_unavailable', 422);
        }

        $customer = $this->socialAuthService->authenticate(
            provider: $providerEnum,
            idToken: (string) $request->input('id_token'),
            nonce: $request->input('nonce'),
            firstName: $request->input('first_name'),
            lastName: $request->input('last_name'),
            ipAddress: $request->ip(),
        );

        if (! $customer->is_active) {
            throw new CustomerAuthException('auth.account_disabled', 403);
        }

        $platform = $request->header('X-Platform', 'web');
        $deviceName = $request->input('device_name');

        $token = $this->tokenIssuer->issue($customer, $deviceName, $platform);

        return new AuthSessionResource($customer, $token);
    }
}
