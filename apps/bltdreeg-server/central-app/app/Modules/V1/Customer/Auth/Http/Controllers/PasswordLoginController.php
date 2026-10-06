<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Http\Requests\LoginRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\AuthSessionResource;
use App\Modules\V1\Customer\Auth\Support\CustomerTokenIssuer;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class PasswordLoginController extends Controller
{
    public function __construct(
        protected readonly CustomerTokenIssuer $tokenIssuer,
    ) {}

    public function __invoke(LoginRequest $request): AuthSessionResource
    {
        $customer = null;

        if ($request->filled('phone')) {
            $normalizedPhone = (string) PhoneNumber::toE164($request->input('phone'));
            $customer = Customer::query()->where('phone', $normalizedPhone)->first();
        } elseif ($request->filled('email')) {
            $email = strtolower(trim((string) $request->input('email')));
            $customer = Customer::query()->where('email', $email)->first();
        }

        if (! $customer || empty($customer->password) || ! Hash::check($request->input('password'), $customer->password)) {
            throw new CustomerAuthException('auth.invalid_credentials', 422);
        }

        if (! $customer->is_active) {
            throw new CustomerAuthException('auth.account_disabled', 403);
        }

        $platform = $request->header('X-Platform', 'web');
        $deviceName = $request->input('device_name');

        $token = $this->tokenIssuer->issue($customer, $deviceName, $platform);

        return new AuthSessionResource($customer, $token);
    }
}
