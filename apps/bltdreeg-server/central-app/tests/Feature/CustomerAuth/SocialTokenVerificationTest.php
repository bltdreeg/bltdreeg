<?php

use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Social\AppleTokenVerifier;
use App\Modules\V1\Customer\Auth\Social\GoogleTokenVerifier;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

function socialTestKey(): array
{
    static $key;
    if ($key) {
        return $key;
    }
    $res = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
    openssl_pkey_export($res, $private);
    $details = openssl_pkey_get_details($res);
    $b64 = fn (string $v) => rtrim(strtr(base64_encode($v), '+/', '-_'), '=');
    $jwk = ['kty' => 'RSA', 'alg' => 'RS256', 'use' => 'sig', 'kid' => 'test-kid',
        'n' => $b64($details['rsa']['n']), 'e' => $b64($details['rsa']['e'])];

    return $key = ['private' => $private, 'jwks' => ['keys' => [$jwk]]];
}

function signToken(array $claims): string
{
    return JWT::encode($claims + ['exp' => time() + 600, 'iat' => time()], socialTestKey()['private'], 'RS256', 'test-kid');
}

beforeEach(function () {
    // التحقق الحقيقي بس — مفيش fake tokens في بيئة testing لما نستخدم JWT حقيقي
    Cache::flush();
    Http::fake([
        'www.googleapis.com/oauth2/v3/certs' => Http::response(socialTestKey()['jwks']),
        'appleid.apple.com/auth/keys' => Http::response(socialTestKey()['jwks']),
    ]);
    config()->set('customer_auth.social.google.client_ids', ['web-client.apps.googleusercontent.com']);
    config()->set('customer_auth.social.apple.enabled', true);
    config()->set('customer_auth.social.apple.client_ids', ['com.bltdreeg.web']);
});

$google = fn (array $over = []) => signToken($over + [
    'iss' => 'https://accounts.google.com', 'aud' => 'web-client.apps.googleusercontent.com',
    'sub' => 'g-1', 'email' => 'a@gmail.com', 'email_verified' => true, 'nonce' => 'n-1',
]);

test('google accepts a valid token with matching nonce', function () use ($google) {
    $identity = app(GoogleTokenVerifier::class)->verify($google(), 'n-1');
    expect($identity->providerUserId)->toBe('g-1')->and($identity->emailVerified)->toBeTrue();
});

test('google rejects wrong audience, wrong nonce and expired tokens', function (array $claims, ?string $nonce) use ($google) {
    try {
        app(GoogleTokenVerifier::class)->verify($google($claims), $nonce);
        $this->fail('expected exception');
    } catch (CustomerAuthException $e) {
        // لازم يكون فشل التوكن نفسه مش provider_unavailable
        expect($e->errorCode)->toBe('auth.social_token_invalid')->and($e->statusCode)->toBe(422);
    }
})->with([
    'wrong aud' => [['aud' => 'someone-else'], 'n-1'],
    'wrong nonce' => [[], 'n-2'],
    'expired' => [['exp' => time() - 3600], 'n-1'],
    'wrong iss' => [['iss' => 'https://evil.example'], 'n-1'],
]);

test('google is unavailable when no client ids are configured', function () use ($google) {
    config()->set('customer_auth.social.google.client_ids', []);
    try {
        app(GoogleTokenVerifier::class)->verify($google(), 'n-1');
        $this->fail('expected exception');
    } catch (CustomerAuthException $e) {
        expect($e->errorCode)->toBe('auth.provider_unavailable');
    }
});

$apple = fn (array $over = []) => signToken($over + [
    'iss' => 'https://appleid.apple.com', 'aud' => 'com.bltdreeg.web',
    'sub' => 'apl-1', 'email' => 'x@privaterelay.appleid.com', 'email_verified' => 'true', 'nonce' => 'n-a',
]);

test('apple accepts a valid token and requires the nonce', function () use ($apple) {
    $identity = app(AppleTokenVerifier::class)->verify($apple(), 'n-a');
    expect($identity->providerUserId)->toBe('apl-1')->and($identity->emailVerified)->toBeTrue();

    try {
        app(AppleTokenVerifier::class)->verify($apple(), null);
        $this->fail('expected exception');
    } catch (CustomerAuthException $e) {
        expect($e->errorCode)->toBe('auth.social_token_invalid');
    }
});

test('apple is unavailable when disabled', function () use ($apple) {
    config()->set('customer_auth.social.apple.enabled', false);
    try {
        app(AppleTokenVerifier::class)->verify($apple(), 'n-a');
        $this->fail('expected exception');
    } catch (CustomerAuthException $e) {
        expect($e->errorCode)->toBe('auth.provider_unavailable');
    }
});

test('auth options lists apple only when enabled and configured', function () {
    $this->getJson('/api/v1/auth/options')->assertJsonPath('social_providers', ['google', 'apple']);
    config()->set('customer_auth.social.apple.enabled', false);
    $this->getJson('/api/v1/auth/options')->assertJsonPath('social_providers', ['google']);
});
