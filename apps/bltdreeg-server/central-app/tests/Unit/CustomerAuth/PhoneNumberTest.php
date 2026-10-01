<?php

use App\Modules\V1\Customer\Auth\Support\PhoneNumber;

test('normalises valid egyptian phone formats to local and e164', function (string $input, string $expectedLocal, string $expectedE164) {
    expect(PhoneNumber::isValid($input))->toBeTrue()
        ->and(PhoneNumber::toLocal($input))->toBe($expectedLocal)
        ->and(PhoneNumber::toE164($input))->toBe($expectedE164);
})->with([
    ['01012345678', '01012345678', '+201012345678'],
    ['+201012345678', '01012345678', '+201012345678'],
    ['201012345678', '01012345678', '+201012345678'],
    ['00201012345678', '01012345678', '+201012345678'],
    ['01123456789', '01123456789', '+201123456789'],
    ['01234567890', '01234567890', '+201234567890'],
    ['01512345678', '01512345678', '+201512345678'],
    ['+20 101 234 5678', '01012345678', '+201012345678'],
    ['010-1234-5678', '01012345678', '+201012345678'],
]);

test('rejects invalid phone numbers', function (string $input) {
    expect(PhoneNumber::isValid($input))->toBeFalse()
        ->and(PhoneNumber::toLocal($input))->toBeNull()
        ->and(PhoneNumber::toE164($input))->toBeNull();
})->with([
    'invalid prefix 019' => '01912345678',
    'invalid prefix 014' => '01412345678',
    'too short' => '0101234567',
    'too long' => '010123456789',
    'non digits' => 'abcdefghijk',
    'us phone' => '+14155552671',
    'empty' => '',
]);
