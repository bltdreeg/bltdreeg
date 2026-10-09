<?php

use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Geo\Contracts\IpGeolocator;
use Bltdreeg\Core\Modules\Geo\Data\Coordinates;
use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('customer_auth.otp.fixed_code', '123456');

    OtpChannelSetting::query()->updateOrCreate(['channel' => 'sms'], [
        'is_enabled' => true,
        'providers' => ['fake'],
        'sort' => 1,
    ]);
    OtpChannelSetting::clearCache();
});

function registerCustomerThroughOtp(string $localPhone, string $e164Phone): Customer
{
    test()->postJson('/api/v1/auth/register', [
        'first_name' => 'Mohamed',
        'last_name' => 'Ali',
        'phone' => $localPhone,
        'password' => 'Password123',
        'accepted_terms' => true,
    ])->assertSuccessful();

    test()->postJson('/api/v1/auth/otp/verify', [
        'phone' => $localPhone,
        'purpose' => 'register',
        'code' => '123456',
        'device_name' => 'Pixel 8',
    ])->assertSuccessful();

    return Customer::query()->where('phone', $e164Phone)->firstOrFail();
}

function ipLocatesTo(?Coordinates $coordinates): void
{
    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn($coordinates);
    app()->instance(IpGeolocator::class, $geolocator);
}

test('factory customers have a full location', function () {
    $customer = Customer::factory()->create();

    expect($customer->city_id)->toBe('EG0111')
        ->and($customer->city->id)->toBe('EG0111')
        ->and($customer->governorate->getTranslation('name', 'en'))->toBe('Cairo')
        ->and($customer->location_confirmed_at)->not->toBeNull();
});

test('city is required at the database level', function () {
    Customer::factory()->create(['city_id' => null]);
})->throws(QueryException::class, 'NOT NULL constraint failed: customers.city_id');

test('unknown city violates the foreign key', function () {
    DB::statement('PRAGMA foreign_keys = ON');

    Customer::factory()->create(['city_id' => 'EG9999']);
})->throws(QueryException::class, 'FOREIGN KEY constraint failed');

test('registration stores the ip location', function () {
    ipLocatesTo(new Coordinates(31.2001, 29.9187));

    $customer = registerCustomerThroughOtp('01011112222', '+201011112222');

    expect($customer->city_id)->toBe('EG0204')
        ->and($customer->location_source)->toBe(LocationSourceEnum::Ip->value)
        ->and($customer->location_confirmed_at)->toBeNull();
});

test('registration with foreign ip stores default city', function () {
    ipLocatesTo(new Coordinates(51.5074, -0.1278));

    $customer = registerCustomerThroughOtp('01011113333', '+201011113333');

    expect($customer->city_id)->toBe('EG0111')
        ->and($customer->location_source)->toBe(LocationSourceEnum::Default->value);
});

test('migration back-fills legacy customers and confirms only gps and manual ones', function () {
    // تلات خطوات: آخر migration بتشيل pending_email، قبلها الفروع، وقبلها العملاء
    $this->artisan('migrate:rollback', ['--step' => 3, '--no-interaction' => true])->assertSuccessful();

    $insert = fn (?float $lat, ?float $lng, ?int $source): int => DB::table('customers')->insertGetId([
        'ulid' => (string) Str::ulid(),
        'phone' => '+2010'.random_int(10000000, 99999999),
        'last_lat' => $lat,
        'last_lng' => $lng,
        'location_source' => $source,
        'locale' => 'ar',
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $noLocation = $insert(null, null, null);
    $gpsAlexandria = $insert(31.2001, 29.9187, LocationSourceEnum::Gps->value);
    $ipCairo = $insert(30.0444, 31.2357, LocationSourceEnum::Ip->value);

    $this->artisan('migrate', ['--no-interaction' => true])->assertSuccessful();

    $row = fn (int $id) => DB::table('customers')->find($id);

    expect($row($noLocation)->city_id)->toBe('EG0111')
        ->and($row($noLocation)->location_confirmed_at)->toBeNull()
        ->and($row($gpsAlexandria)->city_id)->toBe('EG0204')
        ->and($row($gpsAlexandria)->location_confirmed_at)->not->toBeNull()
        ->and($row($ipCairo)->city_id)->toBe('EG0111')
        ->and($row($ipCairo)->location_confirmed_at)->toBeNull();
});

test('account deletion erases the precise location back to the default city', function () {
    $customer = Customer::factory()->inAlexandria()->create(['phone' => '+201012349999']);

    $this->actingAs($customer, 'customer')->deleteJson('/api/v1/me')->assertNoContent();

    $deleted = Customer::withTrashed()->findOrFail($customer->id);

    expect($deleted->city_id)->toBe('EG0111')
        ->and($deleted->last_lat)->toBe(30.043)
        ->and($deleted->last_lng)->toBe(31.235)
        ->and($deleted->location_source)->toBe(LocationSourceEnum::Default->value)
        ->and($deleted->location_confirmed_at)->toBeNull();
});
