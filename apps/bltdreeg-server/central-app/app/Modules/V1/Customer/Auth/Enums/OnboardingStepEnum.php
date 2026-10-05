<?php

namespace App\Modules\V1\Customer\Auth\Enums;

enum OnboardingStepEnum: string
{
    case Phone = 'phone';
    case Name = 'name';
    case Terms = 'terms';
    case Location = 'location';
    case BirthDate = 'birth_date';

    public function isRequired(): bool
    {
        return match ($this) {
            self::Phone, self::Name, self::Terms, self::Location => true,
            self::BirthDate => false,
        };
    }
}
