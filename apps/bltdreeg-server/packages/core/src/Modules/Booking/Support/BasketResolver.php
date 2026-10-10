<?php

namespace Bltdreeg\Core\Modules\Booking\Support;

use Bltdreeg\Core\Modules\Booking\Exceptions\BookingException;
use Bltdreeg\Core\Modules\Booking\Models\Package;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Support\Collection;

/**
 * Turns the ids a customer picked into snapshot lines plus a total duration and
 * price (spec §5.2). Services and packages mix freely. Every id must resolve to an
 * active item of THIS branch — an id that silently vanished would book the wrong
 * duration, so an unknown or foreign id is a refusal, not a skip.
 */
final class BasketResolver
{
    /**
     * @param  array<int, int|string>  $serviceIds
     * @param  array<int, int|string>  $packageIds
     */
    public static function resolve(Branch $branch, array $serviceIds, array $packageIds): ResolvedBasket
    {
        $serviceIds = array_values(array_unique(array_map('intval', $serviceIds)));
        $packageIds = array_values(array_unique(array_map('intval', $packageIds)));

        if ($serviceIds === [] && $packageIds === []) {
            throw BookingException::invalidBasket('A booking needs at least one service or package.');
        }

        $lines = [];
        $sort = 0;

        foreach (self::services($branch, $serviceIds) as $service) {
            if ((int) $service->duration <= 0) {
                throw BookingException::invalidBasket("Service {$service->getKey()} has no duration.");
            }

            $lines[] = new BasketLine(
                serviceId: $service->getKey(),
                packageId: null,
                name: $service->getTranslations('name'),
                price: (float) $service->price,
                duration: (int) $service->duration,
                sort: $sort++,
            );
        }

        foreach (self::packages($branch, $packageIds) as $package) {
            if ($package->services->isEmpty()) {
                throw BookingException::invalidBasket("Package {$package->getKey()} has no member services.");
            }

            $duration = $package->effectiveDuration();

            if ($duration <= 0) {
                throw BookingException::invalidBasket("Package {$package->getKey()} resolves to zero minutes.");
            }

            $lines[] = new BasketLine(
                serviceId: null,
                packageId: $package->getKey(),
                name: $package->getTranslations('name'),
                price: (float) $package->price,
                duration: $duration,
                sort: $sort++,
            );
        }

        $totalDuration = array_sum(array_map(fn (BasketLine $line): int => $line->duration, $lines));
        $totalPrice = array_sum(array_map(fn (BasketLine $line): float => $line->price, $lines));

        if ($totalDuration <= 0) {
            throw BookingException::invalidBasket('A booking cannot be zero minutes long.');
        }

        return new ResolvedBasket(
            lines: $lines,
            totalDuration: $totalDuration,
            totalPrice: round($totalPrice, 2),
            currency: $branch->currency,
        );
    }

    /** @param  array<int, int>  $ids */
    private static function services(Branch $branch, array $ids): Collection
    {
        if ($ids === []) {
            return collect();
        }

        $services = Service::query()
            ->withoutGlobalScopes()
            ->where('branch_id', $branch->getKey())
            ->where('is_active', true)
            ->whereKey($ids)
            ->get();

        self::assertAllFound($services->modelKeys(), $ids, 'service');

        return $services;
    }

    /** @param  array<int, int>  $ids */
    private static function packages(Branch $branch, array $ids): Collection
    {
        if ($ids === []) {
            return collect();
        }

        $packages = Package::query()
            ->withoutGlobalScopes()
            // withoutGlobalScopes() on the eager load too: a member service from
            // another branch must be REJECTED, never silently filtered out of
            // $package->services by ambient BranchContext (which would make the
            // package look fine from inside the panel but wrong from a context
            // with no branch, such as central-app) or silently counted when no
            // context is set.
            ->with(['services' => fn ($query) => $query->withoutGlobalScopes()])
            ->where('branch_id', $branch->getKey())
            ->where('is_active', true)
            ->whereKey($ids)
            ->get();

        self::assertAllFound($packages->modelKeys(), $ids, 'package');

        foreach ($packages as $package) {
            foreach ($package->services as $service) {
                if ((int) $service->branch_id !== (int) $branch->getKey() || ! $service->is_active) {
                    throw BookingException::invalidBasket(
                        "Package {$package->getKey()} has a member service that is not an active service of this branch."
                    );
                }
            }
        }

        return $packages;
    }

    /**
     * @param  array<int, int|string>  $found
     * @param  array<int, int>  $requested
     */
    private static function assertAllFound(array $found, array $requested, string $label): void
    {
        $missing = array_diff($requested, array_map('intval', $found));

        if ($missing !== []) {
            throw BookingException::invalidBasket(
                ucfirst($label).' '.implode(', ', $missing).' is not an active '.$label.' of this branch.'
            );
        }
    }
}
