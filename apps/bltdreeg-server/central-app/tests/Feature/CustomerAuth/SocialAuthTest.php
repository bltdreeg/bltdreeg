<?php

use App\Modules\V1\Customer\Auth\Enums\SocialProviderEnum;
use App\Modules\V1\Customer\Auth\Models\CustomerSocialAccount;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use App\Modules\V1\Customer\Auth\Social\Data\SocialIdentity;
use App\Modules\V1\Customer\Auth\Social\GoogleTokenVerifier;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

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

test('new google user creates customer requiring phone onboarding', function () {
    $googleVerifier = Mockery::mock(GoogleTokenVerifier::class);
    $googleVerifier->shouldReceive('verify')->once()->andReturn(
        new SocialIdentity(
            provider: SocialProviderEnum::Google,
            providerUserId: 'google_sub_123',
            email: 'omar@gmail.com',
            emailVerified: true,
            firstName: 'Omar',
            lastName: 'Khaled',
        )
    );
    app()->instance(GoogleTokenVerifier::class, $googleVerifier);

    $response = $this->postJson('/api/v1/auth/social/google', [
        'id_token' => 'dummy_token',
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure([
            'access_token',
            'user' => [
                'id',
                'phone',
                'onboarding',
            ],
        ])
        ->assertJson([
            'user' => [
                'phone' => null,
                'email' => 'omar@gmail.com',
                'email_verified' => true,
                'onboarding' => [
                    'complete' => false,
                    'missing' => ['phone', 'terms'],
                ],
            ],
        ]);

    expect(CustomerSocialAccount::query()->where('provider_user_id', 'google_sub_123')->exists())->toBeTrue();
});

test('existing social link logs in existing customer', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);

    CustomerSocialAccount::query()->create([
        'customer_id' => $customer->id,
        'provider' => SocialProviderEnum::Google,
        'provider_user_id' => 'existing_sub_456',
        'email' => 'existing@gmail.com',
    ]);

    $googleVerifier = Mockery::mock(GoogleTokenVerifier::class);
    $googleVerifier->shouldReceive('verify')->once()->andReturn(
        new SocialIdentity(
            provider: SocialProviderEnum::Google,
            providerUserId: 'existing_sub_456',
            email: 'existing@gmail.com',
            emailVerified: true,
        )
    );
    app()->instance(GoogleTokenVerifier::class, $googleVerifier);

    $response = $this->postJson('/api/v1/auth/social/google', [
        'id_token' => 'dummy_token',
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'user' => [
                'id' => $customer->ulid,
            ],
        ]);
});

test('social sign in links by verified email to existing account', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'email' => 'sarah@gmail.com',
        'email_verified_at' => now(),
        'is_active' => true,
    ]);

    $googleVerifier = Mockery::mock(GoogleTokenVerifier::class);
    $googleVerifier->shouldReceive('verify')->once()->andReturn(
        new SocialIdentity(
            provider: SocialProviderEnum::Google,
            providerUserId: 'google_sub_789',
            email: 'sarah@gmail.com',
            emailVerified: true,
        )
    );
    app()->instance(GoogleTokenVerifier::class, $googleVerifier);

    $response = $this->postJson('/api/v1/auth/social/google', [
        'id_token' => 'dummy_token',
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'user' => [
                'id' => $customer->ulid,
            ],
        ]);

    $linked = CustomerSocialAccount::query()->where('provider_user_id', 'google_sub_789')->first();
    expect($linked)->not->toBeNull()
        ->and($linked->customer_id)->toBe($customer->id);
});

test('incomplete social user merges into existing account B upon phone verify', function () {
    // Existing account B with phone
    $accountB = Customer::factory()->create([
        'phone' => '+201012345678',
        'first_name' => 'Existing',
        'last_name' => 'Customer',
        'is_active' => true,
    ]);

    // Incomplete social customer
    $incomplete = Customer::factory()->create([
        'phone' => null,
        'first_name' => 'Incomplete',
        'last_name' => 'Social',
        'is_active' => true,
    ]);

    CustomerSocialAccount::query()->create([
        'customer_id' => $incomplete->id,
        'provider' => SocialProviderEnum::Google,
        'provider_user_id' => 'social_to_merge',
        'email' => 'social@gmail.com',
    ]);

    // Act as incomplete user
    $this->actingAs($incomplete, 'customer');

    // Request phone verify code
    $this->postJson('/api/v1/me/phone', [
        'phone' => '01012345678',
    ])->assertSuccessful();

    // Verify phone code
    $response = $this->postJson('/api/v1/me/phone/verify', [
        'phone' => '01012345678',
        'code' => '123456',
        'device_name' => 'Chrome Web',
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'user' => [
                'id' => $accountB->ulid,
                'phone' => '01012345678',
            ],
        ]);

    // Social account moved to B
    $socialAccount = CustomerSocialAccount::query()->where('provider_user_id', 'social_to_merge')->first();
    expect($socialAccount->customer_id)->toBe($accountB->id);

    // Incomplete record deleted
    expect(Customer::find($incomplete->id))->toBeNull();
});

test('merge detects provider conflict and returns 409 auth.social_conflict', function () {
    // Existing account B already linked to Google
    $accountB = Customer::factory()->create([
        'phone' => '+201012345678',
        'is_active' => true,
    ]);
    CustomerSocialAccount::query()->create([
        'customer_id' => $accountB->id,
        'provider' => SocialProviderEnum::Google,
        'provider_user_id' => 'b_google_account',
    ]);

    // Incomplete social customer also has Google
    $incomplete = Customer::factory()->create([
        'phone' => null,
        'is_active' => true,
    ]);
    CustomerSocialAccount::query()->create([
        'customer_id' => $incomplete->id,
        'provider' => SocialProviderEnum::Google,
        'provider_user_id' => 'different_google_account',
    ]);

    $this->actingAs($incomplete, 'customer');

    $this->postJson('/api/v1/me/phone', [
        'phone' => '01012345678',
    ])->assertSuccessful();

    $response = $this->postJson('/api/v1/me/phone/verify', [
        'phone' => '01012345678',
        'code' => '123456',
    ]);

    $response->assertStatus(409)
        ->assertJson([
            'code' => 'auth.social_conflict',
            'data' => [
                'provider' => 'google',
            ],
        ]);
});
