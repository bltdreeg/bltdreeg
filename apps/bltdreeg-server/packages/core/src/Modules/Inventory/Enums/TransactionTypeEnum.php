<?php

namespace Bltdreeg\Core\Modules\Inventory\Enums;

enum TransactionTypeEnum: int
{
    case PURCHASE = 1;
    case SALE = 2;
    case RETURN = 3;
    case ADJUSTMENT = 4;
    case TRANSFER_IN = 5;
    case TRANSFER_OUT = 6;
    case DAMAGED = 7;
    case EXPIRED = 8;

    public function label(): string
    {
        return match ($this) {
            self::PURCHASE => __('core::inventory.purchase'),
            self::SALE => __('core::inventory.sale'),
            self::RETURN => __('core::inventory.return'),
            self::ADJUSTMENT => __('core::inventory.adjustment'),
            self::TRANSFER_IN => __('core::inventory.transfer_in'),
            self::TRANSFER_OUT => __('core::inventory.transfer_out'),
            self::DAMAGED => __('core::inventory.damaged'),
            self::EXPIRED => __('core::inventory.expired'),
        };
    }

    /**
     * Direction the type implies for `inventory_transactions.quantity`, which is
     * always stored as a signed movement so `previous + quantity === balance_after`.
     */
    public function direction(): int
    {
        return match ($this) {
            self::PURCHASE, self::RETURN, self::TRANSFER_IN => 1,
            self::SALE, self::TRANSFER_OUT, self::DAMAGED, self::EXPIRED => -1,
            self::ADJUSTMENT => 0,
        };
    }

    /**
     * `ADJUSTMENT` is the only type whose sign is chosen by the caller, so it is
     * also the only one that cannot be inferred from the type alone.
     */
    public function isPolarityFree(): bool
    {
        return $this === self::ADJUSTMENT;
    }

    public function increasesStock(): bool
    {
        return $this->direction() > 0;
    }

    public function decreasesStock(): bool
    {
        return $this->direction() < 0;
    }
}
