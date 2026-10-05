<?php

use App\Modules\V1\Customer\Auth\Http\Middleware\EnsureCustomerOnboarded;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function () {
    OtpChannelSetting::query()->updateOrCreate(['channel' => 'sms'], [
        'is_enabled' => true,
        'providers' => ['fake'],
        'sort' => 1,
    ]);
    OtpChannelSetting::query()->updateOrCreate(['channel' => 'whatsapp'], [
        'is_enabled' => true,
        'providers' => ['fake'],
        'sort' => 2,
    ]);
    OtpChannelSetting::clearCache();

    // Register a sample route protected by EnsureCustomerOnboarded
    Route::middleware(['auth:customer', EnsureCustomerOnboarded::class])
        ->get('/api/v1/test-booking', fn () => response()->json(['status' => 'ok']));
});

test('unauthenticated request to protected route returns 401 auth.unauthenticated', function () {
    $response = $this->getJson('/api/v1/me');

    $response->assertStatus(401)
        ->assertJson([
            'code' => 'auth.unauthenticated',
        ]);
});

test('staff filament web session cannot access customer api routes without token', function () {
    $staff = User::factory()->superAdmin()->create();

    $response = $this->actingAs($staff, 'web')->getJson('/api/v1/me');

    $response->assertStatus(401)
        ->assertJson([
            'code' => 'auth.unauthenticated',
        ]);
});

test('token expiration slides forward when fewer than 60 days remain', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    // Token with 30 days remaining (< 60 days)
    $token = $customer->createToken('test_device', ['*'], now()->addDays(30));

    $this->withToken($token->plainTextToken)
        ->getJson('/api/v1/me')
        ->assertOk();

    $tokenRecord = $customer->tokens()->find($token->accessToken->id);
    expect(now()->diffInDays($tokenRecord->expires_at))->toBeGreaterThanOrEqual(89);
});

test('ensure customer onboarded middleware blocks incomplete customer', function () {
    // Incomplete customer missing phone and terms
    $incomplete = Customer::factory()->create([
        'phone' => null,
        'terms_accepted_at' => null,
        'is_active' => true,
    ]);

    $response = $this->actingAs($incomplete, 'customer')
        ->getJson('/api/v1/test-booking');

    $response->assertStatus(403)
        ->assertJson([
            'code' => 'auth.onboarding_required',
            'data' => [
                'missing' => ['phone', 'terms'],
            ],
        ]);
});

test('cors allows the configured web origin and rejects others', function () {
    config()->set('cors.allowed_origins', ['https://app.example.com']);

    $allowed = $this->withHeaders([
        'Origin' => 'https://app.example.com',
        'Access-Control-Request-Method' => 'POST',
    ])->options('/api/v1/auth/login');

    expect($allowed->headers->get('Access-Control-Allow-Origin'))->toBe('https://app.example.com');

    $blocked = $this->withHeaders([
        'Origin' => 'https://evil.example.com',
        'Access-Control-Request-Method' => 'POST',
    ])->options('/api/v1/auth/login');

    // With one allowed origin the header always names it, so the browser rejects any other caller.
    expect($blocked->headers->get('Access-Control-Allow-Origin'))->not->toBe('https://evil.example.com');
});

test('error responses honor Accept-Language header', function () {
    // English
    $enResponse = $this->withHeader('Accept-Language', 'en')
        ->postJson('/api/v1/auth/login', [
            'phone' => '01012345678',
            'password' => 'WrongPassword',
        ]);
    $enResponse->assertStatus(422)
        ->assertJson([
            'message' => 'Invalid credentials.',
            'code' => 'auth.invalid_credentials',
        ]);

    // Arabic (default)
    $arResponse = $this->withHeader('Accept-Language', 'ar')
        ->postJson('/api/v1/auth/login', [
            'phone' => '01012345678',
            'password' => 'WrongPassword',
        ]);
    $arResponse->assertStatus(422)
        ->assertJson([
            'message' => 'بيانات الدخول غير صحيحة.',
            'code' => 'auth.invalid_credentials',
        ]);
});

test('public auth options endpoint returns channels and social providers', function () {
    $response = $this->getJson('/api/v1/auth/options');

    $response->assertOk()
        ->assertJsonStructure([
            'otp_channels',
            'social_providers',
            'terms_version',
        ])
        ->assertJson([
            'otp_channels' => ['sms', 'whatsapp'],
            'terms_version' => config('customer_auth.terms_version'),
        ]);
});
