<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $hasLat = $this->filled('lat');
            $hasLng = $this->filled('lng');

            if ($hasLat !== $hasLng) {
                $validator->errors()->add('lat', __('Both lat and lng coordinates must be provided together.'));

                return;
            }

            if ($hasLat && $hasLng) {
                $lat = (float) $this->input('lat');
                $lng = (float) $this->input('lng');

                // Egypt bounding box: Lat ~21.5 - 32.0, Lng ~24.5 - 37.0
                if ($lat < 21.5 || $lat > 32.0 || $lng < 24.5 || $lng > 37.0) {
                    $validator->errors()->add('location', __('Coordinates must be within Egypt.'));
                }
            }
        });
    }
}
