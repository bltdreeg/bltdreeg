<?php

namespace Bltdreeg\Core\Modules\Onboarding\Enums;

enum SubmissionStatusEnum: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case DECLINED = 'declined';

    public function label(): string
    {
        return __('core::onboarding.submission_status.'.$this->value);
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'warning',
            self::APPROVED => 'success',
            self::DECLINED => 'danger',
        };
    }
}
