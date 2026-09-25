<?php

namespace Bltdreeg\Core\Modules\Hr\Enums;

enum LeaveRequestTypeEnum: int
{
    case PERMISSION = 1;
    case SICK = 2;
    case VACATION = 3;
    case EMERGENCY = 4;

    public function label(): string
    {
        return match ($this) {
            self::PERMISSION => __('core::leave_requests.permission'),
            self::SICK => __('core::leave_requests.sick'),
            self::VACATION => __('core::leave_requests.vacation'),
            self::EMERGENCY => __('core::leave_requests.emergency'),
        };
    }
}
