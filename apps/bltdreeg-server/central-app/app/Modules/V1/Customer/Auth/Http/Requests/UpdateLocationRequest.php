<?php

namespace App\Modules\V1\Customer\Auth\Http\Requests;

use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateLocationRequest extends FormRequest
{
    public static function inEgypt(float $lat, float $lng): bool
    {
        return EgyptBounds::contains($lat, $lng);
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
            'source' => ['nullable', 'in:gps,ip,manual'],
            'area_id' => ['nullable', 'string', 'exists:geo_areas,id'],
            'city_id' => ['nullable', 'string', 'exists:geo_cities,id'],
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
