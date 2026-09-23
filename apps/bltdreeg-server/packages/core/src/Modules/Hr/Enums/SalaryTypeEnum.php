<?php

namespace Bltdreeg\Core\Modules\Hr\Enums;

enum SalaryTypeEnum: int
{
    case DAILY = 1;
    case WEEKLY = 2;
    case MONTHLY = 3;

    public function label(): string
    {
        return match ($this) {
            self::DAILY => __('core::users.daily'),
            self::WEEKLY => __('core::users.weekly'),
            self::MONTHLY => __('core::users.monthly'),
        };
    }
}
