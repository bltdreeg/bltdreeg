<?php

use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
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
    OtpChannelSetting::clearCache();
});

test('send otp for unregistered phone returns 422 auth.phone_not_registered', function () {
    $response = $this->postJson('/api/v1/auth/otp', [
        'phone' => '01012345678',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.phone_not_registered',
        ]);
});

test('send otp for registered phone returns challenge', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/otp', [
        'phone' => '01012345678',
        'channel' => 'whatsapp',
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'phone' => '01012345678',
            'purpose' => 'login',
            'channel' => 'whatsapp',
            'code_length' => 6,
            'attempts_left' => 5,
        ]);
});

test('verify otp for login issues AuthSession token', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/auth/otp', [
        'phone' => '01012345678',
    ]);

    $verifyResponse = $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '01012345678',
        'purpose' => 'login',
        'code' => '123456',
    ]);

    $verifyResponse->assertOk()
        ->assertJsonStructure([
            'access_token',
            'token_type',
            'user' => [
                'id',
                'phone',
            ],
        ])
        ->assertJson([
            'user' => [
                'id' => $customer->ulid,
                'phone' => '01012345678',
            ],
        ]);
});

test('wrong code decrements attempts and returns attemptsLeft', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/auth/otp', [
        'phone' => '01012345678',
    ]);

    $response = $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '01012345678',
        'purpose' => 'login',
        'code' => '000000',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.otp_invalid',
            'data' => [
                'attemptsLeft' => 4,
            ],
        ]);
});

test('5 wrong attempts locks challenge for 15 minutes', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/auth/otp', [
        'phone' => '01012345678',
    ]);

    // Send 4 wrong attempts
    for ($i = 0; $i < 4; $i++) {
        $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => '01012345678',
            'purpose' => 'login',
            'code' => '000000',
        ]);
    }

    // 5th wrong attempt triggers lock
    $response = $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '01012345678',
        'purpose' => 'login',
        'code' => '000000',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.otp_locked',
            'data' => [
                'lockMinutes' => 15,
            ],
        ]);

    // Subsequent attempt even with correct code is still locked
    $subsequentResponse = $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '01012345678',
        'purpose' => 'login',
        'code' => '123456',
    ]);

    $subsequentResponse->assertStatus(422)
        ->assertJson([
            'code' => 'auth.otp_locked',
        ]);
});

test('expired otp code returns auth.otp_expired', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/auth/otp', [
        'phone' => '01012345678',
    ]);

    // Time travel 6 minutes into the future
    Carbon::setTestNow(now()->addMinutes(6));

    $response = $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '01012345678',
        'purpose' => 'login',
        'code' => '123456',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.otp_expired',
        ]);

    Carbon::setTestNow();
});

test('resend otp enforces cooldown backoff and switches channel', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/auth/otp', [
        'phone' => '01012345678',
        'channel' => 'sms',
    ]);

    // Immediate resend fails with cooldown
    $tooSoonResponse = $this->postJson('/api/v1/auth/otp/resend', [
        'phone' => '01012345678',
        'purpose' => 'login',
    ]);

    $tooSoonResponse->assertStatus(422)
        ->assertJson([
            'code' => 'auth.otp_resend_too_soon',
        ]);

    // Advance time past 60s cooldown
    Carbon::setTestNow(now()->addSeconds(65));

    // Resend and switch channel to whatsapp
    $resendResponse = $this->postJson('/api/v1/auth/otp/resend', [
        'phone' => '01012345678',
        'purpose' => 'login',
        'channel' => 'whatsapp',
    ]);

    $resendResponse->assertSuccessful()
        ->assertJson([
            'channel' => 'whatsapp',
        ]);

    Carbon::setTestNow();
});
