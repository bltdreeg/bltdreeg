<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Support;

use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\EmployeeAdjustment;
use Filament\Support\Icons\Heroicon;

class AdjustmentPresenter
{
    public static function statusColor(EmployeeAdjustmentStatusEnum $status): string
    {
        return match ($status) {
            EmployeeAdjustmentStatusEnum::APPROVED => 'success',
            EmployeeAdjustmentStatusEnum::APPLIED => 'info',
            EmployeeAdjustmentStatusEnum::CANCELLED => 'danger',
        };
    }

    public static function statusIcon(EmployeeAdjustmentStatusEnum $status): Heroicon
    {
        return match ($status) {
            EmployeeAdjustmentStatusEnum::APPROVED => Heroicon::OutlinedCheckCircle,
            EmployeeAdjustmentStatusEnum::APPLIED => Heroicon::OutlinedCheckBadge,
            EmployeeAdjustmentStatusEnum::CANCELLED => Heroicon::OutlinedXCircle,
        };
    }

    /**
     * Records carry the APPROVED default from the column definition until an
     * approver stamps them, so the label follows the stamp, not the raw enum.
     */
    public static function statusLabel(EmployeeAdjustment $record): string
    {
        return $record->isPending()
            ? __('core::adjustments.pending_approval')
            : $record->status->label();
    }

    public static function statusColorFor(EmployeeAdjustment $record): string
    {
        return $record->isPending() ? 'warning' : self::statusColor($record->status);
    }

    public static function statusIconFor(EmployeeAdjustment $record): Heroicon
    {
        return $record->isPending() ? Heroicon::OutlinedClock : self::statusIcon($record->status);
    }

    public static function typeColor(EmployeeAdjustmentTypeEnum $type): string
    {
        return match ($type) {
            EmployeeAdjustmentTypeEnum::DISCOUNT => 'warning',
            EmployeeAdjustmentTypeEnum::PENALTY => 'danger',
        };
    }

    public static function typeIcon(EmployeeAdjustmentTypeEnum $type): Heroicon
    {
        return match ($type) {
            EmployeeAdjustmentTypeEnum::DISCOUNT => Heroicon::OutlinedScale,
            EmployeeAdjustmentTypeEnum::PENALTY => Heroicon::OutlinedNoSymbol,
        };
    }

    /**
     * @return array<int, string>
     */
    public static function statusOptions(): array
    {
        return collect(EmployeeAdjustmentStatusEnum::cases())
            ->mapWithKeys(fn (EmployeeAdjustmentStatusEnum $status): array => [$status->value => $status->label()])
            ->all();
    }

    /**
     * @return array<int, string>
     */
    public static function typeOptions(): array
    {
        return collect(EmployeeAdjustmentTypeEnum::cases())
            ->mapWithKeys(fn (EmployeeAdjustmentTypeEnum $type): array => [$type->value => $type->label()])
            ->all();
    }

    public static function amount(mixed $amount): string
    {
        return $amount === null ? '—' : number_format((float) $amount, 2);
    }
}
