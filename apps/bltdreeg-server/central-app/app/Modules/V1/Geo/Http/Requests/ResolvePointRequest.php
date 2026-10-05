<?php

namespace App\Modules\V1\Geo\Http\Requests;

use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ResolvePointRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if (! EgyptBounds::contains((float) $this->input('lat'), (float) $this->input('lng'))) {
                $validator->errors()->add('location', __('Coordinates must be within Egypt.'));
            }
        });
    }
}
