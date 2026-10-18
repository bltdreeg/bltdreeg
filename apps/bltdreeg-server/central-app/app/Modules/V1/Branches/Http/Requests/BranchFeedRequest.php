<?php

namespace App\Modules\V1\Branches\Http\Requests;

use Illuminate\Validation\Rule;

class BranchFeedRequest extends NearbyBranchesRequest
{
    public const SORT_NEAREST = 'nearest';

    public const SORT_PRICE = 'price';

    public const SORT_NEWEST = 'newest';

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'q' => ['nullable', 'string', 'max:100'],
            'governorate_id' => ['nullable', 'string', 'size:4'],
            'city_id' => ['nullable', 'string', 'size:6'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'sort' => ['nullable', Rule::in([self::SORT_NEAREST, self::SORT_PRICE, self::SORT_NEWEST])],
        ];
    }

    public function search(): ?string
    {
        $q = trim((string) $this->input('q'));

        return $q === '' ? null : $q;
    }

    public function sort(): string
    {
        return (string) ($this->input('sort') ?? self::SORT_NEAREST);
    }

    public function maxPrice(): ?float
    {
        return $this->filled('max_price') ? (float) $this->input('max_price') : null;
    }
}
