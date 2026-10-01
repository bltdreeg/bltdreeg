<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'accepted_terms' => ['nullable', 'boolean'],
            'area_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
