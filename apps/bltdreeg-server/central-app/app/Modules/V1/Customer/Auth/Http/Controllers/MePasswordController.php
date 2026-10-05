<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Http\Requests\UpdatePasswordRequest;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class MePasswordController extends Controller
{
    /**
     * Update customer password and revoke all other active sessions.
     */
    public function update(UpdatePasswordRequest $request): Response
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if (! empty($customer->password)) {
            $currentPassword = (string) $request->input('current_password');

            if (! Hash::check($currentPassword, $customer->password)) {
                throw new CustomerAuthException('auth.invalid_credentials', 422);
            }
        }

        $customer->password = Hash::make((string) $request->input('password'));
        $customer->save();

        // Revoke other device tokens
        $currentTokenId = $customer->currentAccessToken()?->id;
        if ($currentTokenId) {
            $customer->tokens()->where('id', '!=', $currentTokenId)->delete();
        }

        return response()->noContent();
    }
}
