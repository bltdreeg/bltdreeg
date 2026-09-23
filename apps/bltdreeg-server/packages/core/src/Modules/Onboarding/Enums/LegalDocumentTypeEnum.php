<?php

namespace Bltdreeg\Core\Modules\Onboarding\Enums;

enum LegalDocumentTypeEnum: string
{
    case NATIONAL_ID = 'national_id';
    case PASSPORT = 'passport';
    case DRIVING_LICENSE = 'driving_license';

    public function label(): string
    {
        return __('core::onboarding.document_type.'.$this->value);
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $case): array => [$case->value => $case->label()])
            ->all();
    }
}
