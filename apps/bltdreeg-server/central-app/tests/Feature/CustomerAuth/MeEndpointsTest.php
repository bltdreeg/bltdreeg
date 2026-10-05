<?php

use App\Modules\V1\Customer\Auth\Location\Contracts\IpGeolocator;
use App\Modules\V1\Customer\Auth\Location\Data\Coordinates;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('customer_auth.otp.fixed_code', '123456');

    OtpChannelSetting::query()->updateOrCreate(['channel' => 'sms'], [
        'is_enabled' => true,
        'providers' => ['fake'],
        'sort' => 1,
    ]);
    OtpChannelSetting::query()->updateOrCreate(['channel' => 'email'], [
        'is_enabled' => true,
        'providers' => ['fake'],
        'sort' => 2,
    ]);
    OtpChannelSetting::clearCache();
});

test('customer can get own profile via GET /me', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'first_name' => 'Kareem',
        'last_name' => 'Nabil',
        'is_active' => true,
    ]);

    $response = $this->actingAs($customer, 'customer')->getJson('/api/v1/me');

    $response->assertOk()
        ->assertJson([
            'id' => $customer->ulid,
            'first_name' => 'Kareem',
            'last_name' => 'Nabil',
            'phone' => '01012345678',
            'area_name' => null,
        ]);
});

test('customer can update profile and pending email flow works end to end', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'email' => null,
        'email_verified_at' => null,
        'terms_accepted_at' => null,
        'is_active' => true,
    ]);

    $this->actingAs($customer, 'customer');

    // 1. Update name, birth_date, accepted_terms, and propose new email
    $updateResponse = $this->putJson('/api/v1/me', [
        'first_name' => 'Kareem Updated',
        'last_name' => 'Nabil Updated',
        'birth_date' => '1995-05-15',
        'accepted_terms' => true,
        'email' => 'kareem.new@example.com',
    ]);

    $updateResponse->assertOk()
        ->assertJson([
            'first_name' => 'Kareem Updated',
            'last_name' => 'Nabil Updated',
            'birth_date' => '1995-05-15',
            'email' => null,
            'email_verified' => false,
            'pending_email' => 'kareem.new@example.com',
        ]);

    $customer->refresh();
    expect($customer->terms_accepted_at)->not->toBeNull()
        ->and($customer->pending_email)->toBe('kareem.new@example.com')
        ->and($customer->email)->toBeNull();

    // 2. Verify email code
    $verifyEmailResponse = $this->postJson('/api/v1/me/email/verify', [
        'code' => '123456',
    ]);

    $verifyEmailResponse->assertOk()
        ->assertJson([
            'email' => 'kareem.new@example.com',
            'email_verified' => true,
            'pending_email' => null,
        ]);

    $customer->refresh();
    expect($customer->email)->toBe('kareem.new@example.com')
        ->and($customer->email_verified_at)->not->toBeNull()
        ->and($customer->pending_email)->toBeNull();
});

test('customer can change password and other active tokens are revoked', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'password' => Hash::make('CurrentPassword123'),
        'is_active' => true,
    ]);

    $currentToken = $customer->createToken('current_device');
    $otherToken = $customer->createToken('other_device');

    // Authenticate with currentToken
    $response = $this->withToken($currentToken->plainTextToken)
        ->putJson('/api/v1/me/password', [
            'current_password' => 'CurrentPassword123',
            'password' => 'BrandNewPassword123',
            'password_confirmation' => 'BrandNewPassword123',
        ]);

    $response->assertNoContent();

    // Current token still exists
    expect($customer->tokens()->where('id', $currentToken->accessToken->id)->exists())->toBeTrue()
        // Other token revoked
        ->and($customer->tokens()->where('id', $otherToken->accessToken->id)->exists())->toBeFalse();

    // Customer can log in with new password
    $this->postJson('/api/v1/auth/login', [
        'phone' => '01012345678',
        'password' => 'BrandNewPassword123',
    ])->assertOk();
});

test('customer can update location with egypt coordinates and IP fallback', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    $this->actingAs($customer, 'customer');

    // 1. Valid coordinates in Cairo (lat 30.04, lng 31.23)
    $gpsResponse = $this->putJson('/api/v1/me/location', [
        'lat' => 30.0444,
        'lng' => 31.2357,
    ]);

    $gpsResponse->assertOk()
        ->assertJson([
            'location' => [
                'lat' => 30.0444,
                'lng' => 31.2357,
                'source' => 'gps',
            ],
        ]);

    // 2. Reject coordinates outside Egypt (e.g. London: lat 51.5, lng -0.12)
    $invalidResponse = $this->putJson('/api/v1/me/location', [
        'lat' => 51.5074,
        'lng' => -0.1278,
    ]);
    $invalidResponse->assertStatus(422)
        ->assertJsonValidationErrors(['location']);

    // 3. Fallback to IP geolocation when coordinates are omitted
    // (الـ fallback مبيستبدلش GPS، فنرجّع المصدر لـ ip الأول عشان نختبر التحديث)
    $customer->forceFill(['location_source' => \App\Modules\V1\Customer\Auth\Enums\LocationSourceEnum::Ip->value])->save();
    $fakeGeolocator = Mockery::mock(IpGeolocator::class);
    $fakeGeolocator->shouldReceive('locate')->once()->andReturn(
        new Coordinates(lat: 31.2001, lng: 29.9187)
    );
    app()->instance(IpGeolocator::class, $fakeGeolocator);

    $ipResponse = $this->putJson('/api/v1/me/location', []);
    $ipResponse->assertOk()
        ->assertJson([
            'location' => [
                'lat' => 31.2001,
                'lng' => 29.9187,
                'source' => 'ip',
            ],
        ]);
});

test('customer deletion anonymizes data, soft deletes, and frees phone for re-registration', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'email' => 'to_delete@example.com',
        'first_name' => 'Hassan',
        'last_name' => 'Fahmy',
        'is_active' => true,
    ]);

    $token = $customer->createToken('active_token');

    $response = $this->actingAs($customer, 'customer')->deleteJson('/api/v1/me');
    $response->assertNoContent();

    // Customer soft deleted
    expect(Customer::find($customer->id))->toBeNull();

    $deleted = Customer::withTrashed()->find($customer->id);
    expect($deleted)->not->toBeNull()
        ->and($deleted->trashed())->toBeTrue()
        ->and($deleted->phone)->toBeNull()
        ->and($deleted->email)->toBeNull()
        ->and($deleted->first_name)->toBe('Deleted')
        ->and($deleted->last_name)->toBe('customer')
        ->and($deleted->phone_tombstone_hash)->not->toBeNull()
        ->and($deleted->tokens)->toHaveCount(0);

    // The SAME phone number can now register again!
    $registerResponse = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'New Hassan',
        'last_name' => 'Fahmy',
        'phone' => '01012345678',
        'password' => 'Password123',
    ]);
    $registerResponse->assertSuccessful();
});

test('ip fallback does not overwrite a gps location', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345670',
        'phone_verified_at' => now(),
        'last_lat' => 30.0444,
        'last_lng' => 31.2357,
        'location_source' => \App\Modules\V1\Customer\Auth\Enums\LocationSourceEnum::Gps->value,
        'location_updated_at' => now()->subDays(3),
    ]);

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->never();
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', [])
        ->assertOk()
        ->assertJsonPath('location.source', 'gps')
        ->assertJsonPath('location.lat', 30.0444);
});

test('ip fallback refreshes an existing ip location', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345671',
        'phone_verified_at' => now(),
        'last_lat' => 31.2,
        'last_lng' => 29.9,
        'location_source' => \App\Modules\V1\Customer\Auth\Enums\LocationSourceEnum::Ip->value,
    ]);

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->once()->andReturn(new Coordinates(30.05, 31.24));
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', [])
        ->assertOk()
        ->assertJsonPath('location.source', 'ip')
        ->assertJsonPath('location.lat', 30.05);
});

test('location estimate returns the ip point without saving it', function () {
    $customer = Customer::factory()->create(['phone' => '+201012345672', 'phone_verified_at' => now(), 'last_lat' => null, 'last_lng' => null, 'location_source' => null]);

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->once()->andReturn(new Coordinates(30.05, 31.24));
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')
        ->getJson('/api/v1/me/location/estimate')
        ->assertOk()
        ->assertJsonPath('estimate.lat', 30.05)
        ->assertJsonPath('estimate.lng', 31.24);

    expect($customer->fresh()->last_lat)->toBeNull();
});

test('location estimate is null when the ip resolves outside egypt or fails', function () {
    $customer = Customer::factory()->create(['phone' => '+201012345673', 'phone_verified_at' => now()]);

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn(new Coordinates(52.37, 4.90), null); // أمستردام (VPN) ثم فشل
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')->getJson('/api/v1/me/location/estimate')->assertOk()->assertJsonPath('estimate', null);
    $this->actingAs($customer, 'customer')->getJson('/api/v1/me/location/estimate')->assertOk()->assertJsonPath('estimate', null);
});

test('a manual pin is saved as manual and survives the ip fallback', function () {
    $customer = Customer::factory()->create(['phone' => '+201012345674', 'phone_verified_at' => now()]);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 31.2001, 'lng' => 29.9187, 'source' => 'manual'])
        ->assertOk()
        ->assertJsonPath('location.source', 'manual');

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->never();
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', [])
        ->assertOk()
        ->assertJsonPath('location.source', 'manual');
});

test('location source only accepts gps or manual', function () {
    $customer = Customer::factory()->create(['phone' => '+201012345675', 'phone_verified_at' => now()]);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 30.05, 'lng' => 31.24, 'source' => 'ip'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['source']);
});
