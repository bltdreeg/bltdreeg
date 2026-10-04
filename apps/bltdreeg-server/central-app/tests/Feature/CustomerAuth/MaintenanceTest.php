<?php

use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;

uses(RefreshDatabase::class);

function makeChallenge(array $attrs = []): OtpChallenge
{
    static $n = 0;
    $n++;

    return OtpChallenge::query()->create(array_merge([
        'identifier' => '+201000000'.str_pad((string) $n, 3, '0', STR_PAD_LEFT),
        'purpose' => 'login',
        'channel' => 'sms',
        'code_hash' => 'x',
        'attempts' => 0,
        'send_count' => 1,
        'next_resend_at' => now(),
        'expires_at' => now()->addMinutes(5),
    ], $attrs));
}

test('prune command removes consumed and long-expired challenges only', function () {
    $consumed = makeChallenge(['consumed_at' => now()]);
    $stale = makeChallenge(['expires_at' => now()->subDays(2)]);
    $open = makeChallenge();
    $locked = makeChallenge(['expires_at' => now()->subDays(2), 'locked_until' => now()->addMinutes(10)]);

    $this->artisan('customer-auth:prune-otp')->assertSuccessful();

    expect(OtpChallenge::query()->pluck('id')->all())
        ->toEqualCanonicalizing([$open->id, $locked->id]);
});

test('api docs are hidden from non super admins outside local', function () {
    app()->detectEnvironment(fn () => 'production');

    expect(Gate::allows('viewApiDocs'))->toBeFalse()
        ->and(Gate::forUser(User::factory()->superAdmin()->make())->allows('viewApiDocs'))->toBeTrue();
});

test('otp channel settings survive a real cache round trip', function () {
    // The array driver skips serialization, which hid a bug: with cache.serializable_classes = false
    // a cached model collection came back as __PHP_Incomplete_Class in the queue worker.
    config(['cache.default' => 'file', 'cache.serializable_classes' => false]);
    app('cache')->forgetDriver('file');
    OtpChannelSetting::query()->updateOrCreate(['channel' => 'sms'], [
        'is_enabled' => true,
        'providers' => ['log'],
        'sort' => 1,
    ]);
    OtpChannelSetting::clearCache();

    OtpChannelSetting::getCached(); // warms the cache
    $sms = OtpChannelSetting::getCached()->firstWhere('channel', 'sms'); // reads it back

    expect($sms)->toBeInstanceOf(OtpChannelSetting::class)
        ->and($sms->providers)->toBe(['log'])
        ->and($sms->is_enabled)->toBeTrue();

    OtpChannelSetting::clearCache();
});
