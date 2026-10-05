<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class OtpRequest extends FormRequest
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
            'channel' => ['nullable', new Enum(OtpChannelEnum::class)],
        ];
    }
}
