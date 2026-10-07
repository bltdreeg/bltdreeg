<?php

namespace App\Modules\V1\Branches\Http\Requests;

use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
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
     * النقطة بس لو جوه مصر؛ برا مصر (VPN/سفر) بنرجع للـ IP بدل ما نرفض الطلب.
     *
     * @return array{float, float}|null
     */
    public function point(): ?array
    {
        if (! $this->filled('lat') || ! $this->filled('lng')) {
            return null;
        }

        $lat = (float) $this->input('lat');
        $lng = (float) $this->input('lng');

        return EgyptBounds::contains($lat, $lng) ? [$lat, $lng] : null;
    }

    public function perPage(): int
    {
        return (int) ($this->input('per_page') ?? self::PER_PAGE);
    }
}
