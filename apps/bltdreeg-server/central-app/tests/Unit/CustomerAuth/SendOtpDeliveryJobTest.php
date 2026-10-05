<?php

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use App\Modules\V1\Customer\Auth\Otp\Jobs\SendOtpDeliveryJob;
use App\Modules\V1\Customer\Auth\Otp\OtpDispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('job is assigned to the otp queue', function () {
    $message = new OtpMessage(
        recipient: '+201012345678',
        code: '123456',
        purpose: OtpPurposeEnum::Login,
        locale: 'ar',
        channel: OtpChannelEnum::Sms,
    );

    $job = new SendOtpDeliveryJob($message);

    expect($job->queue)->toBe('otp');
});

test('job dispatches message through OtpDispatcher', function () {
    OtpChannelSetting::query()->updateOrCreate(['channel' => 'sms'], [
        'is_enabled' => true,
        'providers' => ['log'],
        'sort' => 1,
    ]);
    OtpChannelSetting::clearCache();

    $challenge = OtpChallenge::create([
        'identifier' => '+201012345678',
        'purpose' => OtpPurposeEnum::Login,
        'channel' => OtpChannelEnum::Sms,
        'code_hash' => bcrypt('123456'),
        'attempts' => 0,
        'send_count' => 1,
        'next_resend_at' => now()->addMinute(),
        'expires_at' => now()->addMinutes(5),
    ]);

    $message = new OtpMessage(
        recipient: '+201012345678',
        code: '123456',
        purpose: OtpPurposeEnum::Login,
        locale: 'ar',
        channel: OtpChannelEnum::Sms,
    );

    $dispatcherMock = Mockery::mock(OtpDispatcher::class);
    $dispatcherMock->shouldReceive('dispatch')
        ->once()
        ->with($message, Mockery::on(fn ($c) => $c->id === $challenge->id));

    $job = new SendOtpDeliveryJob($message, $challenge->id);
    $job->handle($dispatcherMock);
});

test('job skips dispatching if challenge is already consumed', function () {
    $challenge = OtpChallenge::create([
        'identifier' => '+201012345678',
        'purpose' => OtpPurposeEnum::Login,
        'channel' => OtpChannelEnum::Sms,
        'code_hash' => bcrypt('123456'),
        'attempts' => 0,
        'send_count' => 1,
        'next_resend_at' => now()->addMinute(),
        'expires_at' => now()->addMinutes(5),
        'consumed_at' => now(),
    ]);

    $message = new OtpMessage(
        recipient: '+201012345678',
        code: '123456',
        purpose: OtpPurposeEnum::Login,
        locale: 'ar',
        channel: OtpChannelEnum::Sms,
    );

    $dispatcherMock = Mockery::mock(OtpDispatcher::class);
    $dispatcherMock->shouldNotReceive('dispatch');

    $job = new SendOtpDeliveryJob($message, $challenge->id);
    $job->handle($dispatcherMock);
});
