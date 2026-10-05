<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('customer can log in using phone and password', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345678',
        'phone_verified_at' => now(),
        'password' => Hash::make('Secret123'),
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'phone' => '01012345678',
        'password' => 'Secret123',
        'device_name' => 'iPhone 15',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'access_token',
            'token_type',
            'expires_at',
            'user' => [
                'id',
                'phone',
                'has_password',
            ],
        ])
        ->assertJson([
            'token_type' => 'Bearer',
            'user' => [
                'id' => $customer->ulid,
                'phone' => '01012345678',
                'has_password' => true,
            ],
        ]);
});

test('customer can log in using verified email and password', function () {
    $customer = Customer::factory()->create([
        'email' => 'customer@example.com',
        'email_verified_at' => now(),
        'password' => Hash::make('Secret123'),
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'customer@example.com',
        'password' => 'Secret123',
    ]);

    $response->assertOk()
        ->assertJson([
            'user' => [
                'id' => $customer->ulid,
                'email' => 'customer@example.com',
            ],
        ]);
});

test('unverified email cannot log in with password', function () {
    Customer::factory()->create([
        'email' => 'unverified@example.com',
        'email_verified_at' => null,
        'password' => Hash::make('Secret123'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'unverified@example.com',
        'password' => 'Secret123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.invalid_credentials',
        ]);
});

test('social-only account cannot log in with password', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
        'password' => null,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'phone' => '01012345678',
        'password' => 'AnyPassword123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.invalid_credentials',
        ]);
});

test('disabled account returns 403 auth.account_disabled', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
        'password' => Hash::make('Secret123'),
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'phone' => '01012345678',
        'password' => 'Secret123',
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'code' => 'auth.account_disabled',
        ]);
});

test('wrong password returns 422 auth.invalid_credentials', function () {
    Customer::factory()->create([
        'phone' => '+201012345678',
        'password' => Hash::make('CorrectPassword123'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'phone' => '01012345678',
        'password' => 'WrongPassword123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'code' => 'auth.invalid_credentials',
        ]);
});
