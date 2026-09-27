<?php

namespace Bltdreeg\Core\Modules\Inventory\Enums;

enum PurchaseStatusEnum: int
{
    case DRAFT = 1;
    case RECEIVED = 2;
    case CANCELLED = 3;

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => __('core::inventory.draft'),
            self::RECEIVED => __('core::inventory.received'),
            self::CANCELLED => __('core::inventory.cancelled'),
        };
    }
}
