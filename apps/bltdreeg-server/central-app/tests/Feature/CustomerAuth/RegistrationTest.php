<?php

use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Configure fixed OTP code for deterministic tests
    config()->set('customer_auth.otp.fixed_code', '123456');

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
    OtpChannelSetting::query()->updateOrCreate(['channel' => 'email'], [
        'is_enabled' => true,
        'providers' => ['fake'],
        'sort' => 3,
    ]);
    OtpChannelSetting::clearCache();
});

test('customer can initiate registration and receive OTP challenge', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Mohamed',
        'last_name' => 'Ali',
        'phone' => '01012345678',
        'password' => 'Password123',
        'email' => 'mohamed@example.com',
        'accepted_terms' => true,
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure([
            'phone',
            'purpose',
            'channel',
            'code_length',
            'expires_at',
            'resend_available_at',
            'attempts_left',
        ])
        ->assertJson([
            'phone' => '01012345678',
            'purpose' => 'register',
            'code_length' => 6,
            'attempts_left' => 5,
        ]);

    // Ensure customer row is NOT created before verify
    expect(Customer::query()->where('phone', '+201012345678')->exists())->toBeFalse();

    // Challenge exists with encrypted payload
    $challenge = OtpChallenge::query()
        ->where('identifier', '+201012345678')
        ->where('purpose', OtpPurposeEnum::Register)
        ->first();

    expect($challenge)->not->toBeNull()
        ->and($challenge->payload['first_name'])->toBe('Mohamed')
        ->and(Hash::check('Password123', $challenge->payload['password']))->toBeTrue();
});

test('registration verify creates customer with verified phone and returns AuthSession', function () {
    $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Mohamed',
        'last_name' => 'Ali',
        'phone' => '01012345678',
        'password' => 'Password123',
        'email' => 'mohamed@example.com',
        'accepted_terms' => true,
    ]);

    $verifyResponse = $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '01012345678',
        'purpose' => 'register',
        'code' => '123456',
        'device_name' => 'Pixel 8',
    ]);

    $verifyResponse->assertSuccessful()
        ->assertJsonStructure([
            'access_token',
            'token_type',
            'expires_at',
            'user' => [
                'id',
                'first_name',
                'last_name',
                'phone',
                'phone_verified',
                'email',
                'email_verified',
                'area_name',
                'has_password',
                'onboarding',
            ],
        ])
        ->assertJson([
            'token_type' => 'Bearer',
            'user' => [
                'first_name' => 'Mohamed',
                'last_name' => 'Ali',
                'phone' => '01012345678',
                'phone_verified' => true,
                'email' => 'mohamed@example.com',
                'email_verified' => false,
                'area_name' => null,
                'has_password' => true,
            ],
        ]);

    $customer = Customer::query()->where('phone', '+201012345678')->first();
    expect($customer)->not->toBeNull()
        ->and($customer->phone_verified_at)->not->toBeNull()
        ->and($customer->terms_accepted_at)->not->toBeNull()
        ->and($customer->tokens)->toHaveCount(1);
});

test('registration rejects already registered phone with auth.phone_taken', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
    ]);

    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Mohamed',
        'last_name' => 'Ali',
        'phone' => '01012345678',
        'password' => 'Password123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.phone_taken',
        ]);
});

test('registration rejects already verified email with auth.email_taken', function () {
    Customer::factory()->create([
        'email' => 'taken@example.com',
        'email_verified_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Mohamed',
        'last_name' => 'Ali',
        'phone' => '01012345678',
        'password' => 'Password123',
        'email' => 'taken@example.com',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.email_taken',
        ]);
});

test('registration verify handles unique phone race condition', function () {
    $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Mohamed',
        'last_name' => 'Ali',
        'phone' => '01012345678',
        'password' => 'Password123',
    ]);

    // Another customer takes the phone right before verify
    Customer::factory()->create([
        'phone' => '+201012345678',
    ]);

    $verifyResponse = $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '01012345678',
        'purpose' => 'register',
        'code' => '123456',
    ]);

    $verifyResponse->assertStatus(422)
        ->assertJson([
            'code' => 'auth.phone_taken',
        ]);
});
