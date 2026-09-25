<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Support;

use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\LeaveRequest;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Carbon;

class LeaveRequestPresenter
{
    public static function statusColor(LeaveRequestStatusEnum $status): string
    {
        return match ($status) {
            LeaveRequestStatusEnum::PENDING => 'warning',
            LeaveRequestStatusEnum::APPROVED => 'success',
            LeaveRequestStatusEnum::REJECTED => 'danger',
            LeaveRequestStatusEnum::CANCELLED => 'gray',
        };
    }

    public static function statusIcon(LeaveRequestStatusEnum $status): Heroicon
    {
        return match ($status) {
            LeaveRequestStatusEnum::PENDING => Heroicon::OutlinedClock,
            LeaveRequestStatusEnum::APPROVED => Heroicon::OutlinedCheckCircle,
            LeaveRequestStatusEnum::REJECTED => Heroicon::OutlinedXCircle,
            LeaveRequestStatusEnum::CANCELLED => Heroicon::OutlinedNoSymbol,
        };
    }

    public static function statusLabel(LeaveRequest $record): string
    {
        return $record->status->label();
    }

    public static function typeColor(LeaveRequestTypeEnum $type): string
    {
        return match ($type) {
            LeaveRequestTypeEnum::PERMISSION => 'info',
            LeaveRequestTypeEnum::SICK => 'danger',
            LeaveRequestTypeEnum::VACATION => 'success',
            LeaveRequestTypeEnum::EMERGENCY => 'warning',
        };
    }

    public static function typeIcon(LeaveRequestTypeEnum $type): Heroicon
    {
        return match ($type) {
            LeaveRequestTypeEnum::PERMISSION => Heroicon::OutlinedClipboardDocumentList,
            LeaveRequestTypeEnum::SICK => Heroicon::OutlinedHeart,
            LeaveRequestTypeEnum::VACATION => Heroicon::OutlinedSun,
            LeaveRequestTypeEnum::EMERGENCY => Heroicon::OutlinedExclamationTriangle,
        };
    }

    /**
     * @return array<int, string>
     */
    public static function statusOptions(): array
    {
        return collect(LeaveRequestStatusEnum::cases())
            ->mapWithKeys(fn (LeaveRequestStatusEnum $status): array => [$status->value => $status->label()])
            ->all();
    }

    /**
     * @return array<int, string>
     */
    public static function typeOptions(): array
    {
        return collect(LeaveRequestTypeEnum::cases())
            ->mapWithKeys(fn (LeaveRequestTypeEnum $type): array => [$type->value => $type->label()])
            ->all();
    }

    public static function days(int $count): string
    {
        return trans_choice('core::leave_requests.days', $count, ['count' => $count]);
    }

    public static function period(?Carbon $start, ?Carbon $end): string
    {
        if (! $start instanceof Carbon || ! $end instanceof Carbon) {
            return '—';
        }

        return $start->format('Y-m-d').' → '.$end->format('Y-m-d');
    }
}
