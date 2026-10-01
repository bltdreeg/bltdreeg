<?php

namespace App\Modules\V1\Customer\Auth\Http\Resources;

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Laravel\Sanctum\NewAccessToken;

class AuthSessionResource extends JsonResource
{
    protected ?NewAccessToken $token;

    public function __construct(Customer $customer, ?NewAccessToken $token = null)
    {
        parent::__construct($customer);
        $this->token = $token;
    }

    public function toArray(Request $request): array
    {
        return [
            'access_token' => $this->token?->plainTextToken ?? '',
            'token_type' => 'Bearer',
            'expires_at' => $this->token?->accessToken?->expires_at?->toISOString(),
            'user' => new CustomerResource($this->resource),
        ];
    }
}
