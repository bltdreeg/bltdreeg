<?php

namespace Bltdreeg\Core\Modules\Tenancy\Enums;

enum TenantStatusEnum: string
{
    case DRAFT = 'draft';
    case PENDING_REVIEW = 'pending_review';
    case APPROVED = 'approved';
    case DECLINED = 'declined';

    public function label(): string
    {
        return __('core::onboarding.tenant_status.'.$this->value);
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::PENDING_REVIEW => 'warning',
            self::APPROVED => 'success',
            self::DECLINED => 'danger',
        };
    }
}
