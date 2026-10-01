<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['nullable', 'string'],
            'email' => ['nullable', 'string', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $hasPhone = $this->filled('phone');
            $hasEmail = $this->filled('email');

            if (! $hasPhone && ! $hasEmail) {
                $validator->errors()->add('phone', __('validation.required_without', ['attribute' => 'phone', 'values' => 'email']));

                return;
            }

            if ($hasPhone && ! PhoneNumber::isValid((string) $this->input('phone'))) {
                $validator->errors()->add('phone', __('The phone must be a valid Egyptian mobile number.'));
            }
        });
    }
}
