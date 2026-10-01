<?php

use App\Modules\V1\Customer\Auth\Enums\OtpChannelEnum;
use App\Modules\V1\Customer\Auth\Enums\OtpPurposeEnum;
use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use App\Modules\V1\Customer\Auth\Otp\Contracts\OtpProvider;
use App\Modules\V1\Customer\Auth\Otp\Data\DeliveryResult;
use App\Modules\V1\Customer\Auth\Otp\Data\OtpMessage;
use App\Modules\V1\Customer\Auth\Otp\OtpDispatcher;
use App\Modules\V1\Customer\Auth\Otp\OtpProviderManager;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('throws channel_unavailable if channel setting is disabled', function () {
    OtpChannelSetting::query()->updateOrCreate(['channel' => 'sms'], [
        'is_enabled' => false,
        'providers' => ['log'],
        'sort' => 1,
    ]);
    OtpChannelSetting::clearCache();

    $dispatcher = app(OtpDispatcher::class);
    $message = new OtpMessage(
        recipient: '+201012345678',
        code: '123456',
        purpose: OtpPurposeEnum::Login,
        locale: 'ar',
        channel: OtpChannelEnum::Sms,
    );

    $dispatcher->dispatch($message);
})->throws(CustomerAuthException::class);

test('falls back to second provider when first fails', function () {
    OtpChannelSetting::query()->updateOrCreate(['channel' => 'sms'], [
        'is_enabled' => true,
        'providers' => ['failing', 'working'],
        'sort' => 1,
    ]);
    OtpChannelSetting::clearCache();

    $failingProvider = Mockery::mock(OtpProvider::class);
    $failingProvider->shouldReceive('send')->once()->andReturn(DeliveryResult::failure('Simulated network error'));

    $workingProvider = Mockery::mock(OtpProvider::class);
    $workingProvider->shouldReceive('send')->once()->andReturn(DeliveryResult::success('msg_123'));

    $manager = Mockery::mock(OtpProviderManager::class);
    $manager->shouldReceive('driver')->with('failing')->andReturn($failingProvider);
    $manager->shouldReceive('driver')->with('working')->andReturn($workingProvider);

    $dispatcher = new OtpDispatcher($manager);

    $message = new OtpMessage(
        recipient: '+201012345678',
        code: '123456',
        purpose: OtpPurposeEnum::Login,
        locale: 'ar',
        channel: OtpChannelEnum::Sms,
    );

    $delivery = $dispatcher->dispatch($message);

    expect($delivery->status)->toBe('sent')
        ->and($delivery->provider)->toBe('working')
        ->and($delivery->channel)->toBe('sms')
        ->and($delivery->recipient_masked)->toBe('+2010****5678');
});

test('masks phone and email recipients properly', function () {
    $dispatcher = app(OtpDispatcher::class);
    $reflection = new ReflectionClass($dispatcher);
    $method = $reflection->getMethod('maskRecipient');
    $method->setAccessible(true);

    $maskedPhone = $method->invoke($dispatcher, '+201012345678', OtpChannelEnum::Sms);
    expect($maskedPhone)->toBe('+2010****5678');

    $maskedEmail = $method->invoke($dispatcher, 'ahmed@example.com', OtpChannelEnum::Email);
    expect($maskedEmail)->toBe('a***d@example.com');
});
