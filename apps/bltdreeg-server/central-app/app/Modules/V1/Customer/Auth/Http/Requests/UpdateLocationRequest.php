<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateLocationRequest extends FormRequest
{
    /** Egypt bounding box: [min, max] */
    public const EGYPT_BOUNDS = ['lat' => [21.5, 32.0], 'lng' => [24.5, 37.0]];

    public static function inEgypt(float $lat, float $lng): bool
    {
        return $lat >= self::EGYPT_BOUNDS['lat'][0] && $lat <= self::EGYPT_BOUNDS['lat'][1]
            && $lng >= self::EGYPT_BOUNDS['lng'][0] && $lng <= self::EGYPT_BOUNDS['lng'][1];
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'source' => ['nullable', 'in:gps,manual'],
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

                if (! self::inEgypt($lat, $lng)) {
                    $validator->errors()->add('location', __('Coordinates must be within Egypt.'));
                }
            }
        });
    }
}
