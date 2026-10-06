<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', function ($attribute, $value, $fail) {
                if (! PhoneNumber::isValid($value)) {
                    $fail(__('validation.custom.phone.invalid', ['attribute' => $attribute]));
                }
            }],
            'password' => ['required', 'string', Password::min(8)->letters()->numbers()],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'accepted_terms' => ['nullable', 'boolean'],
            'channel' => ['nullable', new Enum(OtpChannelEnum::class)],
        ];
    }

    protected function passedValidation(): void
    {
        $normalizedPhone = PhoneNumber::toE164($this->input('phone'));

        if ($normalizedPhone && Customer::query()->where('phone', $normalizedPhone)->exists()) {
            throw new CustomerAuthException('auth.phone_taken', 422);
        }

        if ($this->filled('email')) {
            $emailTaken = Customer::query()
                ->where('email', strtolower(trim((string) $this->input('email'))))
                ->exists();

            if ($emailTaken) {
                throw new CustomerAuthException('auth.email_taken', 422);
            }
        }
    }
}
