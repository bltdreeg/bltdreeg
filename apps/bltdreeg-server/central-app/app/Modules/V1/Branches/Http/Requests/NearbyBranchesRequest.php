<?php

namespace App\Modules\V1\Branches\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NearbyBranchesRequest extends FormRequest
{
    public const PER_PAGE = 12;

    public const MAX_PER_PAGE = 48;

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
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
    }

    /**
     * الموقع الحقيقي للزائر، جوه مصر أو برا — بنرتب الفروع بالمسافة الحقيقية مهما كان مكانه.
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

    public function perPage(): int
    {
        return (int) ($this->input('per_page') ?? self::PER_PAGE);
    }
}
