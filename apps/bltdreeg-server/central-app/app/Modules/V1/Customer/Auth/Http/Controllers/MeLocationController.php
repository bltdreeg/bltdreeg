<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Http\Requests\UpdateLocationRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\CustomerResource;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            $customer->location_source = (LocationSourceEnum::tryFromLabel((string) $request->input('source', 'gps')) ?? LocationSourceEnum::Gps)->value;
            $customer->location_updated_at = now();
            $customer->save();
        } elseif ($customer->last_lat === null || $customer->location_source === LocationSourceEnum::Ip->value) {
            // موقع الـ GPS أدق من تخمين الـ IP، فمبنستبدلوش أبداً بالـ fallback
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

    /**
     * Read-only IP estimate used to center the onboarding map. Never writes.
     */
    public function estimate(Request $request, IpGeolocator $geolocator): JsonResponse
    {
        $coords = $geolocator->locate($request->ip());

        // VPN بيطلّع دولة تانية: مبنرجعش نقطة برا مصر، والويب بيبدأ الخريطة من القاهرة
        $inEgypt = $coords !== null && UpdateLocationRequest::inEgypt($coords->lat, $coords->lng);

        return response()->json([
            'estimate' => $inEgypt ? ['lat' => $coords->lat, 'lng' => $coords->lng] : null,
        ]);
    }
}
