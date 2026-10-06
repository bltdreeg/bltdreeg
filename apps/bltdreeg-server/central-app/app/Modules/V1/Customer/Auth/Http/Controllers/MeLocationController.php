<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Http\Requests\UpdateLocationRequest;
use App\Modules\V1\Customer\Auth\Http\Resources\CustomerResource;
use App\Modules\V1\Geo\Http\Resources\ResolvedLocationResource;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class MeLocationController extends Controller
{
    /**
     * Update the customer's location.
     *
     * With `area_id` (or `city_id`, resolved to one of its areas) it is an explicit confirmation by the customer: it always wins and completes the
     * onboarding step. Without it the update is automatic (GPS refresh, IP fallback) and never replaces
     * a more trusted location.
     */
    public function update(UpdateLocationRequest $request, LocationResolver $resolver): CustomerResource
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $current = LocationSourceEnum::tryFrom((int) $customer->location_source) ?? LocationSourceEnum::Default;
        $lat = $request->filled('lat') ? (float) $request->input('lat') : null;
        $lng = $request->filled('lng') ? (float) $request->input('lng') : null;
        $source = LocationSourceEnum::tryFromLabel($request->input('source')) ?? LocationSourceEnum::Gps;

        if ($request->filled('area_id') || $request->filled('city_id')) {
            $location = $request->filled('area_id')
                ? $resolver->forArea((string) $request->input('area_id'), $lat, $lng, $source)
                : $resolver->forCity((string) $request->input('city_id'), $lat, $lng, $source);

            $customer->forceFill([...$location->toCustomerColumns(), 'location_confirmed_at' => now()])->save();
        } elseif ($lat !== null && $lng !== null) {
            $location = $resolver->nearest($lat, $lng, $source);

            if ($source === LocationSourceEnum::Manual || $current->canBeReplacedAutomaticallyBy($source)) {
                $customer->forceFill($location->toCustomerColumns())->save();
            }
        } elseif ($current->canBeReplacedAutomaticallyBy(LocationSourceEnum::Ip)) {
            $location = $resolver->fromIp($request->ip());

            if ($location->source === LocationSourceEnum::Ip) {
                $customer->forceFill($location->toCustomerColumns())->save();
            }
        }

        return new CustomerResource($customer->fresh(['governorate', 'city', 'area']));
    }

    /**
     * Read-only estimate used to pre-fill the onboarding dropdowns. Never writes, never null.
     */
    public function estimate(Request $request, LocationResolver $resolver): JsonResponse
    {
        return response()->json([
            'estimate' => (new ResolvedLocationResource($resolver->fromIp($request->ip())))->resolve($request),
        ]);
    }
}
