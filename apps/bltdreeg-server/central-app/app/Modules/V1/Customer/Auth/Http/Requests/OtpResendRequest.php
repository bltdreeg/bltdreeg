<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Validator;

class OtpResendRequest extends FormRequest
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
            'purpose' => ['required', Rule::in(['register', 'login', 'reset_password'])],
            'channel' => ['nullable', new Enum(OtpChannelEnum::class)],
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
