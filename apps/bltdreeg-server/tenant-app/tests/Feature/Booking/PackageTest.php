<?php

use Bltdreeg\Core\Modules\Booking\Models\Package;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function packageWithServices(array $services, array $attributes = []): Package
{
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $package = Package::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        ...$attributes,
    ]);

    foreach ($services as $service) {
        $package->services()->attach(
            Service::factory()->create([
                'tenant_id' => $tenant->id,
                'branch_id' => $branch->id,
                'duration' => $service['duration'],
                'price' => $service['price'],
            ])
        );
    }

    return $package->load('services');
}

test('a package keeps a translatable name', function () {
    $package = Package::factory()->create([
        'name' => ['en' => 'Full groom', 'ar' => 'باكدج كامل'],
    ])->fresh();

    expect($package->getTranslation('name', 'en'))->toBe('Full groom')
        ->and($package->getTranslation('name', 'ar'))->toBe('باكدج كامل');
});

test('a package is priced in egp by default', function () {
    expect(Package::factory()->create()->fresh()->currency)->toBe(CurrencyEnum::EGP);
});

test('the duration defaults to the sum of its services', function () {
    $package = packageWithServices([
        ['duration' => 30, 'price' => 100],
        ['duration' => 20, 'price' => 60],
    ], ['duration' => null]);

    expect($package->effectiveDuration())->toBe(50);
});

test('an explicit duration overrides the sum', function () {
    $package = packageWithServices([
        ['duration' => 30, 'price' => 100],
        ['duration' => 20, 'price' => 60],
    ], ['duration' => 40]);

    expect($package->effectiveDuration())->toBe(40);
});

test('the saving is the services total minus the package price', function () {
    $package = packageWithServices([
        ['duration' => 30, 'price' => 100],
        ['duration' => 20, 'price' => 60],
    ], ['price' => 130]);

    expect($package->servicesTotal())->toBe(160.0)
        ->and($package->savingAmount())->toBe(30.0);
});

test('packages are scoped to the branch in context', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $theirs = Branch::factory()->create(['tenant_id' => $tenant->id]);

    Package::factory()->create(['tenant_id' => $tenant->id, 'branch_id' => $mine->id]);
    Package::factory()->create(['tenant_id' => $tenant->id, 'branch_id' => $theirs->id]);

    app(BranchContext::class)->set($mine);

    expect(Package::query()->count())->toBe(1);

    app(BranchContext::class)->flush();
});

test('a service cannot be attached to a package in another branch', function () {
    $package = packageWithServices([]);
    $otherTenant = Tenant::factory()->create();
    $foreign = Service::factory()->create([
        'tenant_id' => $otherTenant->id,
        'branch_id' => Branch::factory()->create(['tenant_id' => $otherTenant->id])->id,
    ]);

    expect(fn () => $package->attachService($foreign))
        ->toThrow(InvalidArgumentException::class);
});
