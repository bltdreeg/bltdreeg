<?php

use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Carbon\Carbon;
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

test('forgot password by phone and by email returns challenge', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'email' => 'client@example.com',
        'email_verified_at' => now(),
        'is_active' => true,
    ]);

    // By phone
    $phoneResponse = $this->postJson('/api/v1/auth/password/forgot', [
        'phone' => '01012345678',
    ]);
    $phoneResponse->assertSuccessful()
        ->assertJson([
            'phone' => '01012345678',
            'purpose' => 'reset_password',
        ]);

    // By email
    $emailResponse = $this->postJson('/api/v1/auth/password/forgot', [
        'email' => 'client@example.com',
    ]);
    $emailResponse->assertSuccessful()
        ->assertJson([
            'email' => 'client@example.com',
            'purpose' => 'reset_password',
        ]);
});

test('forgot password for unknown account returns 422 auth.account_not_found', function () {
    $response = $this->postJson('/api/v1/auth/password/forgot', [
        'phone' => '01099999999',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.account_not_found',
        ]);
});

test('full password reset flow: forgot -> verify -> reset -> login with new password', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'password' => Hash::make('OldPassword123'),
        'is_active' => true,
    ]);

    // Existing device token
    $oldToken = $customer->createToken('old_device');

    // 1. Forgot
    $this->postJson('/api/v1/auth/password/forgot', [
        'phone' => '01012345678',
    ])->assertSuccessful();

    // 2. Verify code
    $verifyResponse = $this->postJson('/api/v1/auth/password/verify', [
        'phone' => '01012345678',
        'code' => '123456',
    ]);

    $verifyResponse->assertOk()
        ->assertJsonStructure([
            'reset_token',
            'expires_at',
        ]);

    $resetToken = $verifyResponse->json('reset_token');
    expect($resetToken)->not->toBeEmpty();

    // 3. Reset
    $resetResponse = $this->postJson('/api/v1/auth/password/reset', [
        'reset_token' => $resetToken,
        'password' => 'NewSecurePassword123',
        'password_confirmation' => 'NewSecurePassword123',
        'device_name' => 'Safari Mac',
    ]);

    $resetResponse->assertOk()
        ->assertJsonStructure([
            'access_token',
            'user',
        ]);

    // Ensure all OLD tokens were revoked
    expect($customer->tokens()->where('id', $oldToken->accessToken->id)->exists())->toBeFalse();

    // 4. Login with new password
    $loginResponse = $this->postJson('/api/v1/auth/login', [
        'phone' => '01012345678',
        'password' => 'NewSecurePassword123',
    ]);
    $loginResponse->assertOk();

    // 5. Old password no longer works
    $oldLoginResponse = $this->postJson('/api/v1/auth/login', [
        'phone' => '01012345678',
        'password' => 'OldPassword123',
    ]);
    $oldLoginResponse->assertStatus(422)
        ->assertJson([
            'code' => 'auth.invalid_credentials',
        ]);

    // 6. Token is single-use: cannot reset again
    $reuseResponse = $this->postJson('/api/v1/auth/password/reset', [
        'reset_token' => $resetToken,
        'password' => 'AnotherPassword123',
        'password_confirmation' => 'AnotherPassword123',
    ]);
    $reuseResponse->assertStatus(422)
        ->assertJson([
            'code' => 'auth.reset_token_invalid',
        ]);
});

test('expired reset token returns 422 auth.reset_token_invalid', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/auth/password/forgot', [
        'phone' => '01012345678',
    ])->assertSuccessful();

    $verifyResponse = $this->postJson('/api/v1/auth/password/verify', [
        'phone' => '01012345678',
        'code' => '123456',
    ]);
    $resetToken = $verifyResponse->json('reset_token');

    // Advance time 11 minutes (valid for 10 min)
    Carbon::setTestNow(now()->addMinutes(11));

    $resetResponse = $this->postJson('/api/v1/auth/password/reset', [
        'reset_token' => $resetToken,
        'password' => 'NewPassword123',
        'password_confirmation' => 'NewPassword123',
    ]);

    $resetResponse->assertStatus(422)
        ->assertJson([
            'code' => 'auth.reset_token_invalid',
        ]);

    Carbon::setTestNow();
});
