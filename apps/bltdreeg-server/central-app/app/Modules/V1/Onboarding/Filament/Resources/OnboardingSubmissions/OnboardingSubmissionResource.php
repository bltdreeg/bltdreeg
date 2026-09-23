<?php

namespace App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions;

use App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Pages\ListOnboardingSubmissions;
use App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Pages\ViewOnboardingSubmission;
use App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Schemas\OnboardingSubmissionInfolist;
use App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Tables\OnboardingSubmissionsTable;
use BackedEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OnboardingSubmissionResource extends Resource
{
    protected static ?string $model = TenantOnboardingSubmission::class;

    protected static ?string $slug = 'onboarding-submissions';

    protected static ?int $navigationSort = 0;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentCheck;

    public static function getNavigationGroup(): string
    {
        return __('core::global.administration');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::onboarding.admin.submissions');
    }

    public static function getLabel(): string
    {
        return __('core::onboarding.admin.submission');
    }

    public static function getPluralLabel(): string
    {
        return __('core::onboarding.admin.submissions');
    }

    public static function getNavigationBadge(): ?string
    {
        $pending = TenantOnboardingSubmission::query()
            ->where('status', SubmissionStatusEnum::PENDING->value)
            ->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function infolist(Schema $schema): Schema
    {
        return OnboardingSubmissionInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OnboardingSubmissionsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOnboardingSubmissions::route('/'),
            'view' => ViewOnboardingSubmission::route('/{record}'),
        ];
    }
}
