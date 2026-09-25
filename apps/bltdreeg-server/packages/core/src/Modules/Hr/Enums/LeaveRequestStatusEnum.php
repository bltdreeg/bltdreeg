<?php

namespace Bltdreeg\Core\Modules\Hr\Enums;

enum LeaveRequestStatusEnum: int
{
    case PENDING = 1;
    case APPROVED = 2;
    case REJECTED = 3;
    case CANCELLED = 4;

    public function label(): string
    {
        return match ($this) {
            self::PENDING => __('core::leave_requests.pending'),
            self::APPROVED => __('core::leave_requests.approved'),
            self::REJECTED => __('core::leave_requests.rejected'),
            self::CANCELLED => __('core::leave_requests.cancelled'),
        };
    }
}
