<?php

namespace App\Modules\V1\Customer\Auth\Http\Resources;

use App\Modules\V1\Customer\Auth\Enums\LocationSourceEnum;
use App\Modules\V1\Customer\Auth\Support\OnboardingStatus;
use App\Modules\V1\Customer\Auth\Support\PhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $onboarding = OnboardingStatus::for($this->resource);

        $socialProviders = $this->resource->relationLoaded('socialAccounts')
            ? $this->resource->socialAccounts->map(fn ($acc) => $acc->provider->slug())->values()->all()
            : $this->resource->socialAccounts()->get()->map(fn ($acc) => $acc->provider->slug())->values()->all();

        $location = null;
        if ($this->resource->last_lat !== null && $this->resource->last_lng !== null) {
            $location = [
                'lat' => (float) $this->resource->last_lat,
                'lng' => (float) $this->resource->last_lng,
                'source' => LocationSourceEnum::tryFrom((int) $this->resource->location_source)?->label(),
                'updated_at' => $this->resource->location_updated_at?->toISOString(),
            ];
        }

        return [
            'id' => $this->resource->ulid,
            'first_name' => $this->resource->first_name,
            'last_name' => $this->resource->last_name,
            'phone' => $this->resource->phone ? PhoneNumber::toLocal($this->resource->phone) : null,
            'phone_verified' => $this->resource->phone_verified_at !== null,
            'email' => $this->resource->email,
            'email_verified' => $this->resource->email_verified_at !== null,
            'pending_email' => $this->resource->pending_email,
            'birth_date' => $this->resource->birth_date?->format('Y-m-d'),
            'area_name' => null,
            'has_password' => ! empty($this->resource->password),
            'social_providers' => $socialProviders,
            'location' => $location,
            'onboarding' => $onboarding,
        ];
    }
}
