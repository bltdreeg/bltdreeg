<?php

use App\Modules\V1\Services\Models\Service;
use App\Support\CatalogImporter;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogService;
use Bltdreeg\Core\Modules\Catalog\Support\Catalog;
use Bltdreeg\Core\Modules\Geo\Support\CurrencyResolver;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('services and categories keep a name and description per locale', function () {
    $tenant = Tenant::factory()->create();
    $service = Service::factory()->create([
        'tenant_id' => $tenant->id,
        'name' => ['en' => 'Haircut', 'ar' => 'قص الشعر'],
        'description' => ['en' => 'Classic cut', 'ar' => 'قصة كلاسيكية'],
    ])->fresh();

    expect($service->getTranslation('name', 'en'))->toBe('Haircut')
        ->and($service->getTranslation('name', 'ar'))->toBe('قص الشعر')
        ->and($service->getTranslation('description', 'ar'))->toBe('قصة كلاسيكية');
});

test('importing a catalog service keeps every translation', function () {
    $tenant = Tenant::factory()->create();
    $catalog = CatalogService::factory()->create([
        'name' => ['en' => 'Haircut', 'ar' => 'قص الشعر'],
        'description' => ['en' => 'Classic cut', 'ar' => 'قصة كلاسيكية'],
    ]);

    $service = app(CatalogImporter::class)->importService($catalog, $tenant)->fresh();

    expect($service->getTranslations('name'))->toBe(['en' => 'Haircut', 'ar' => 'قص الشعر'])
        ->and($service->category->getTranslations('name'))->toBe($catalog->category->getTranslations('name'));
});

test('a service is priced in egp unless another currency is given', function () {
    $tenant = Tenant::factory()->create();

    $service = Service::factory()->create(['tenant_id' => $tenant->id])->fresh();

    expect($service->currency)->toBe(CurrencyEnum::EGP);
});

test('the currency follows the country of the location', function () {
    expect(CurrencyResolver::forCoordinates(30.0444, 31.2357))->toBe(CurrencyEnum::EGP)
        ->and(CurrencyResolver::forCoordinates(0.0, 0.0))->toBe(CurrencyResolver::DEFAULT);
});

test('the catalog seeder stores arabic and english names and does not duplicate on a second run', function () {
    Catalog::seed();
    Catalog::seed();

    $haircut = CatalogService::query()->where('name->en', 'Haircut')->get();

    expect($haircut)->toHaveCount(1)
        ->and($haircut->first()->getTranslation('name', 'ar'))->toBe('قص الشعر')
        ->and(CatalogService::query()->count())->toBe(count(Catalog::SERVICES));
});

test('the backfill migration translates untouched catalog copies and keeps hand-made translations', function () {
    $tenant = Tenant::factory()->create();
    $catalog = CatalogService::factory()->create(['name' => ['en' => 'Haircut', 'ar' => 'Haircut'], 'description' => ['en' => 'Haircut', 'ar' => 'Haircut']]);
    $untouched = Service::factory()->create(['tenant_id' => $tenant->id, 'catalog_service_id' => $catalog->id, 'name' => ['en' => 'Haircut', 'ar' => 'Haircut']]);
    $custom = Service::factory()->create(['tenant_id' => $tenant->id, 'catalog_service_id' => $catalog->id, 'name' => ['en' => 'Haircut', 'ar' => 'قصة خاصة']]);

    (require base_path('../packages/core/database/migrations/2026_10_07_000007_backfill_catalog_translations_and_branch_currency.php'))->up();

    expect($catalog->fresh()->getTranslation('name', 'ar'))->toBe('قص الشعر')
        ->and($untouched->fresh()->getTranslation('name', 'ar'))->toBe('قص الشعر')
        ->and($custom->fresh()->getTranslation('name', 'ar'))->toBe('قصة خاصة');
});
