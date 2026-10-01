<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;

class MePhoneVerifyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', function ($attribute, $value, $fail) {
                if (! PhoneNumber::isValid($value)) {
                    $fail(__('The phone must be a valid Egyptian mobile number.'));
                }
            }],
            'code' => ['required', 'string', 'size:6'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
