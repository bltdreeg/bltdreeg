<?php

use App\Modules\V1\Customer\Auth\Support\OnboardingStatus;
use Bltdreeg\Core\Modules\Customers\Models\Customer;

test('identifies fully onboarded customer', function () {
    $customer = new Customer([
        'phone' => '+201012345678',
        'phone_verified_at' => now(),
        'first_name' => 'Ahmed',
        'last_name' => 'Samy',
        'terms_accepted_at' => now(),
    ]);

    $status = OnboardingStatus::for($customer);

    expect($status['complete'])->toBeTrue()
        ->and($status['missing'])->toBeEmpty()
        ->and($status['skippable'])->toContain('birth_date');
});

test('identifies incomplete customer with missing phone and terms', function () {
    $customer = new Customer([
        'phone' => null,
        'first_name' => 'Ahmed',
        'last_name' => 'Samy',
        'terms_accepted_at' => null,
    ]);

    $status = OnboardingStatus::for($customer);

    expect($status['complete'])->toBeFalse()
        ->and($status['missing'])->toContain('phone')
        ->and($status['missing'])->toContain('terms')
        ->and($status['missing'])->not->toContain('name');
});

test('identifies missing name', function () {
    $customer = new Customer([
        'phone' => '+201012345678',
        'phone_verified_at' => now(),
        'first_name' => null,
        'last_name' => null,
        'terms_accepted_at' => now(),
    ]);

    $status = OnboardingStatus::for($customer);

    expect($status['complete'])->toBeFalse()
        ->and($status['missing'])->toContain('name');
});
