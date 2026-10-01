<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Enums\LocationSourceEnum;
use App\Modules\V1\Customer\Auth\Http\Requests\UpdateLocationRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\CustomerResource;
use App\Modules\V1\Customer\Auth\Location\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Routing\Controller;

class MeLocationController extends Controller
{
    /**
     * Update customer location using GPS coordinates or client IP geolocation fallback.
     */
    public function update(UpdateLocationRequest $request, IpGeolocator $geolocator): CustomerResource
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if ($request->filled('lat') && $request->filled('lng')) {
            $customer->last_lat = (float) $request->input('lat');
            $customer->last_lng = (float) $request->input('lng');
            $customer->location_source = LocationSourceEnum::Gps->value;
            $customer->location_updated_at = now();
            $customer->save();
        } else {
            $coords = $geolocator->locate($request->ip());

            if ($coords !== null) {
                $customer->last_lat = $coords->lat;
                $customer->last_lng = $coords->lng;
                $customer->location_source = LocationSourceEnum::Ip->value;
                $customer->location_updated_at = now();
                $customer->save();
            }
        }

        return new CustomerResource($customer->fresh());
    }
}
