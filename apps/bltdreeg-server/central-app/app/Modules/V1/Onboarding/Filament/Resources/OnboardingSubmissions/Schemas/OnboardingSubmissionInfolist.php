<?php

namespace App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Schemas;

use App\Modules\V1\Onboarding\Support\SubmissionComparison;
use App\Modules\V1\Shared\Http\Controllers\PrivateFileController;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\View;
use Filament\Schemas\Schema;

class OnboardingSubmissionInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make(__('core::onboarding.admin.salon'))
                    ->schema([
                        Grid::make(3)->schema([
                            TextEntry::make('tenant.name')->label(__('core::onboarding.admin.salon')),
                            TextEntry::make('tenant.slug')->label('Slug'),
                            TextEntry::make('tenant.email')->label('Email'),
                            TextEntry::make('tenant.phone')->label(__('core::onboarding.register.phone')),
                            TextEntry::make('submittedBy.name')->label(__('core::onboarding.admin.submitted_by'))->placeholder('—'),
                            TextEntry::make('created_at')->label(__('core::onboarding.admin.submitted_at'))->dateTime(),
                            TextEntry::make('revision')->label(__('core::onboarding.admin.revision'))->prefix('#'),
                            TextEntry::make('status')
                                ->label(__('core::onboarding.admin.status'))
                                ->badge()
                                ->formatStateUsing(fn (SubmissionStatusEnum $state): string => $state->label())
                                ->color(fn (SubmissionStatusEnum $state): string => $state->color()),
                            TextEntry::make('reviewedBy.name')->label(__('core::onboarding.admin.reviewed_by'))->placeholder('—'),
                        ]),
                        TextEntry::make('decline_reason')
                            ->label(__('core::onboarding.admin.decline_reason'))
                            ->visible(fn (TenantOnboardingSubmission $record): bool => filled($record->decline_reason)),
                    ]),
                Section::make(__('core::onboarding.admin.document'))
                    ->schema([
                        TextEntry::make('document')
                            ->hiddenLabel()
                            ->state(fn (TenantOnboardingSubmission $record): string => $record->legalDocument()
                                ? __('core::onboarding.admin.view_document').' — '.$record->legalDocument()->type->label()
                                : __('core::onboarding.admin.no_document'))
                            ->url(fn (TenantOnboardingSubmission $record): ?string => ($document = $record->legalDocument())
                                ? PrivateFileController::temporaryUrl($document)
                                : null)
                            ->openUrlInNewTab()
                            ->color('primary'),
                    ]),
                Section::make(__('core::onboarding.admin.answers'))
                    ->description(fn (TenantOnboardingSubmission $record): ?string => $record->revision > 1 && $record->previousRevision()
                        ? __('core::onboarding.admin.comparison', ['revision' => $record->previousRevision()->revision])
                        : null)
                    ->schema([
                        View::make('filament.onboarding.submission-comparison')
                            ->viewData(fn (TenantOnboardingSubmission $record): array => [
                                'rows' => SubmissionComparison::rows($record),
                                'hasPrevious' => $record->previousRevision() !== null,
                            ]),
                    ]),
                Section::make(__('core::onboarding.admin.history'))
                    ->collapsed()
                    ->schema([
                        View::make('filament.onboarding.submission-history')
                            ->viewData(fn (TenantOnboardingSubmission $record): array => [
                                'revisions' => TenantOnboardingSubmission::query()
                                    ->where('tenant_id', $record->tenant_id)
                                    ->with('reviewedBy')
                                    ->orderByDesc('revision')
                                    ->get(),
                                'currentId' => $record->getKey(),
                            ]),
                    ]),
            ]);
    }
}
