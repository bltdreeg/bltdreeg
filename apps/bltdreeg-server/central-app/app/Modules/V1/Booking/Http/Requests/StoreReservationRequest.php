<?php

namespace App\Modules\V1\Booking\Http\Requests;

use Bltdreeg\Core\Modules\Queue\Enums\ReservationTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReservationRequest extends FormRequest
{
    public const MAX_SERVICES = 10;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(ReservationTypeEnum::class)],
            'chair_id' => ['required_if:type,join_now', 'integer'],
            'slot_id' => ['required_if:type,slot', 'integer'],
            'service_ids' => ['required', 'array', 'min:1', 'max:'.self::MAX_SERVICES],
            'service_ids.*' => ['integer', 'distinct'],
        ];
    }

    public function reservationType(): ReservationTypeEnum
    {
        return ReservationTypeEnum::from((string) $this->input('type'));
    }

    /**
     * @return list<int>
     */
    public function serviceIds(): array
    {
        return array_map('intval', (array) $this->input('service_ids'));
    }
}
