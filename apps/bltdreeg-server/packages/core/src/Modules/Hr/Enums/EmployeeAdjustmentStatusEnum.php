<?php

namespace Bltdreeg\Core\Modules\Hr\Enums;

enum EmployeeAdjustmentStatusEnum: int
{
    case APPROVED = 1;
    case APPLIED = 2;
    case CANCELLED = 3;

    public function label(): string
    {
        return match ($this) {
            self::APPROVED => __('core::adjustments.approved'),
            self::APPLIED => __('core::adjustments.applied'),
            self::CANCELLED => __('core::adjustments.cancelled'),
        };
    }
}
