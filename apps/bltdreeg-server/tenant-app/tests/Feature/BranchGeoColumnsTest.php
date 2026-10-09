<?php

declare(strict_types=1);

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('factory branches have a full location with float coordinates', function () {
    $branch = Branch::factory()->create();

    expect($branch->city_id)->toBe('EG0111')
        ->and($branch->city->id)->toBe('EG0111')
        ->and($branch->governorate->id)->toBe('EG01')
        ->and($branch->latitude)->toBeFloat()
        ->and($branch->location_source)->toBe(LocationSourceEnum::Manual->value);
});

test('branch city is required at the database level', function () {
    Branch::factory()->create(['city_id' => null]);
})->throws(QueryException::class, 'NOT NULL constraint failed: branches.city_id');

test('branch coordinates are required at the database level', function () {
    Branch::factory()->create(['latitude' => null]);
})->throws(QueryException::class, 'NOT NULL constraint failed: branches.latitude');

test('demo data branches get a full location', function () {
    $this->seed();

    $branches = Branch::query()->withoutGlobalScopes()->get();

    expect($branches)->not->toBeEmpty();

    $branches->each(function (Branch $branch): void {
        expect($branch->city_id)->not->toBeNull()
            ->and($branch->latitude)->toBeFloat();
    });
});

test('migration back-fills legacy branches with blank, junk and real coordinates', function () {
    $tenant = Tenant::factory()->create();
    $this->artisan('migrate:rollback', ['--step' => 1, '--no-interaction' => true])->assertSuccessful();

    $insert = fn (?string $lat, ?string $lng): int => DB::table('branches')->insertGetId([
        'tenant_id' => $tenant->getKey(),
        'name' => json_encode(['en' => 'Legacy']),
        'latitude' => $lat,
        'longitude' => $lng,
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $blank = $insert('', '');
    $junk = $insert('abc', null);
    $alexandria = $insert('31.2001', '29.9187');

    $this->artisan('migrate', ['--no-interaction' => true])->assertSuccessful();

    expect(DB::table('branches')->find($blank)->city_id)->toBe('EG0111')
        ->and(DB::table('branches')->find($junk)->city_id)->toBe('EG0111')
        ->and(DB::table('branches')->find($alexandria)->city_id)->toBe('EG0204');
});
