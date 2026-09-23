<?php

namespace Bltdreeg\Core\Modules\Hr\Enums;

enum AttendenceStatusEnum: int
{
    case PRESENT = 1;
    case ABSENT = 2;
    case DAY_OFF = 3;
    case LATE = 4;
    case ON_LEAVE = 5;

    public function label(): string
    {
        return match ($this) {
            self::PRESENT => __('core::users.present'),
            self::ABSENT => __('core::users.absent'),
            self::DAY_OFF => __('core::users.day_off'),
            self::LATE => __('core::users.late'),
            self::ON_LEAVE => __('core::users.on_leave'),
        };
    }
}
