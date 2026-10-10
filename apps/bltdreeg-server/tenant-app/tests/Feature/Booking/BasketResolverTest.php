<?php

use Bltdreeg\Core\Modules\Booking\Exceptions\BookingException;
use Bltdreeg\Core\Modules\Booking\Models\Package;
use Bltdreeg\Core\Modules\Booking\Support\BasketResolver;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

function serviceIn(Branch $branch, int $duration, float $price, bool $active = true): Service
{
    return Service::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => $duration,
        'price' => $price,
        'is_active' => $active,
    ]);
}

test('services sum their durations and prices', function () {
    $branch = Branch::factory()->create();
    $a = serviceIn($branch, 30, 120);
    $b = serviceIn($branch, 20, 60);

    $basket = BasketResolver::resolve($branch, [$a->id, $b->id], []);

    expect($basket->totalDuration)->toBe(50)
        ->and($basket->totalPrice)->toBe(180.0)
        ->and($basket->lines)->toHaveCount(2);
});

test('services and packages mix freely', function () {
    $branch = Branch::factory()->create();
    $loose = serviceIn($branch, 15, 50);

    $package = Package::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'price' => 150,
        'duration' => null,
    ]);
    $package->attachService(serviceIn($branch, 30, 100));
    $package->attachService(serviceIn($branch, 20, 80));

    $basket = BasketResolver::resolve($branch, [$loose->id], [$package->id]);

    expect($basket->totalDuration)->toBe(65)
        ->and($basket->totalPrice)->toBe(200.0)
        ->and($basket->lines)->toHaveCount(2);
});

test('an empty basket is rejected', function () {
    $branch = Branch::factory()->create();

    expect(fn () => BasketResolver::resolve($branch, [], []))
        ->toThrow(BookingException::class, 'at least one');
});

test('a service from another branch is rejected', function () {
    $branch = Branch::factory()->create();
    $otherTenant = Tenant::factory()->create();
    $foreignBranch = Branch::factory()->create(['tenant_id' => $otherTenant->id]);
    $foreign = serviceIn($foreignBranch, 30, 100);

    expect(fn () => BasketResolver::resolve($branch, [$foreign->id], []))
        ->toThrow(BookingException::class);
});

test('an inactive service is rejected', function () {
    $branch = Branch::factory()->create();
    $inactive = serviceIn($branch, 30, 100, active: false);

    expect(fn () => BasketResolver::resolve($branch, [$inactive->id], []))
        ->toThrow(BookingException::class);
});

test('a package with no member services is rejected', function () {
    $branch = Branch::factory()->create();
    $empty = Package::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => null,
    ]);

    expect(fn () => BasketResolver::resolve($branch, [], [$empty->id]))
        ->toThrow(BookingException::class, 'no member services');
});

test('a package whose override duration is zero is rejected', function () {
    $branch = Branch::factory()->create();
    $package = Package::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => 0,
    ]);
    $package->attachService(serviceIn($branch, 30, 100));

    expect(fn () => BasketResolver::resolve($branch, [], [$package->id]))
        ->toThrow(BookingException::class, 'zero minutes');
});

test('an unknown id is rejected rather than silently skipped', function () {
    $branch = Branch::factory()->create();

    expect(fn () => BasketResolver::resolve($branch, [99999], []))
        ->toThrow(BookingException::class);
});

test('lines carry snapshots ready for booking items', function () {
    $branch = Branch::factory()->create();
    $service = serviceIn($branch, 30, 120);

    $line = BasketResolver::resolve($branch, [$service->id], [])->lines[0];
    $attributes = $line->toItemAttributes();

    expect($attributes['service_id'])->toBe($service->id)
        ->and($attributes['package_id'])->toBeNull()
        ->and($attributes['duration_snapshot'])->toBe(30)
        ->and((float) $attributes['price_snapshot'])->toBe(120.0);
});

test('a package with a member service from another branch is rejected', function () {
    $branch = Branch::factory()->create();
    $package = Package::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => null,
    ]);

    $otherTenant = Tenant::factory()->create();
    $otherBranch = Branch::factory()->create(['tenant_id' => $otherTenant->id]);
    $foreign = serviceIn($otherBranch, 30, 100);

    // Attached directly through the pivot, bypassing attachService()'s own
    // branch guard -- exactly what a Filament relation field (plan 2) would do.
    DB::table('package_service')->insert([
        'package_id' => $package->id,
        'service_id' => $foreign->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(fn () => BasketResolver::resolve($branch, [], [$package->id]))
        ->toThrow(BookingException::class);
});

test('a package with an inactive member service is rejected', function () {
    $branch = Branch::factory()->create();
    $package = Package::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'branch_id' => $branch->id,
        'duration' => null,
    ]);
    $inactive = serviceIn($branch, 30, 100, active: false);

    DB::table('package_service')->insert([
        'package_id' => $package->id,
        'service_id' => $inactive->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(fn () => BasketResolver::resolve($branch, [], [$package->id]))
        ->toThrow(BookingException::class);
});
