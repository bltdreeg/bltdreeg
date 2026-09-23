<?php

namespace Bltdreeg\Core\Modules\Onboarding\Enums;

enum TeamSizeEnum: string
{
    case INDEPENDENT = 'independent';
    case SMALL = '2-5';
    case MEDIUM = '6-10';
    case LARGE = '11-20';
    case XLARGE = '20+';

    public function label(): string
    {
        return __('core::onboarding.team_size.'.$this->value);
    }

    /**
     * How many example employees the approval seeder creates.
     */
    public function exampleEmployeeCount(): int
    {
        return match ($this) {
            self::INDEPENDENT => 0,
            self::SMALL => 1,
            self::MEDIUM, self::LARGE, self::XLARGE => 2,
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $case): array => [$case->value => $case->label()])
            ->all();
    }
}
