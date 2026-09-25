<?php

namespace Bltdreeg\Core\Modules\Hr\Enums;

enum EmployeeAdjustmentTypeEnum: int
{
    case DISCOUNT = 1;
    case PENALTY = 2;

    public function label(): string
    {
        return match ($this) {
            self::DISCOUNT => __('core::adjustments.discount'),
            self::PENALTY => __('core::adjustments.penalty'),
        };
    }
}
