<?php

namespace App\Modules\V1\Branches\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BranchDetailRequest extends FormRequest
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
            'lat' => ['nullable', 'numeric', 'between:-90,90', 'required_with:lng'],
            'lng' => ['nullable', 'numeric', 'between:-180,180', 'required_with:lat'],
        ];
    }

    /**
     * موقع الزائر لو بعته — للمسافة بس، الصفحة شغالة من غيره.
     *
     * @return array{float, float}|null
     */
    public function point(): ?array
    {
        if (! $this->filled('lat') || ! $this->filled('lng')) {
            return null;
        }

        return [(float) $this->input('lat'), (float) $this->input('lng')];
    }
}
