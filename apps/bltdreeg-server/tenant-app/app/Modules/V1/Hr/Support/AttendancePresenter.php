<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Support;

use Bltdreeg\Core\Modules\Hr\Enums\AttendenceStatusEnum;
use Filament\Support\Icons\Heroicon;

class AttendancePresenter
{
    public static function minutesClock(?int $minutes): string
    {
        if ($minutes === null) {
            return '—';
        }

        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    public static function statusColor(AttendenceStatusEnum $status): string
    {
        return match ($status) {
            AttendenceStatusEnum::PRESENT => 'success',
            AttendenceStatusEnum::LATE => 'warning',
            AttendenceStatusEnum::ABSENT => 'danger',
            AttendenceStatusEnum::ON_LEAVE => 'info',
            AttendenceStatusEnum::DAY_OFF => 'gray',
        };
    }

    public static function statusIcon(AttendenceStatusEnum $status): Heroicon
    {
        return match ($status) {
            AttendenceStatusEnum::PRESENT => Heroicon::OutlinedCheckCircle,
            AttendenceStatusEnum::LATE => Heroicon::OutlinedExclamationTriangle,
            AttendenceStatusEnum::ABSENT => Heroicon::OutlinedXCircle,
            AttendenceStatusEnum::ON_LEAVE => Heroicon::OutlinedCalendarDays,
            AttendenceStatusEnum::DAY_OFF => Heroicon::OutlinedMoon,
        };
    }

    /**
     * @return array<string, string>
     */
    public static function statusOptions(): array
    {
        return collect(AttendenceStatusEnum::cases())
            ->mapWithKeys(fn (AttendenceStatusEnum $status): array => [$status->value => $status->label()])
            ->all();
    }
}
