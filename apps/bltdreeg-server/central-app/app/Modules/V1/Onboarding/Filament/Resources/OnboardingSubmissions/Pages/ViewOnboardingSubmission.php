<?php

namespace App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Pages;

use App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\OnboardingSubmissionResource;
use App\Modules\V1\Onboarding\Services\OnboardingReviewService;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use DomainException;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

/**
 * @property TenantOnboardingSubmission $record
 */
class ViewOnboardingSubmission extends ViewRecord
{
    protected static string $resource = OnboardingSubmissionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('approve')
                ->label(__('core::onboarding.admin.approve'))
                ->color('success')
                ->icon('heroicon-o-check-circle')
                ->requiresConfirmation()
                ->modalDescription(__('core::onboarding.admin.approve_confirm'))
                ->visible(fn (): bool => $this->record->isPending())
                ->authorize('update', $this->record)
                ->action(fn () => $this->review(
                    fn (OnboardingReviewService $service, User $reviewer) => $service->approve($this->record, $reviewer),
                    __('core::onboarding.admin.approved'),
                )),
            Action::make('decline')
                ->label(__('core::onboarding.admin.decline'))
                ->color('danger')
                ->icon('heroicon-o-x-circle')
                ->visible(fn (): bool => $this->record->isPending())
                ->authorize('update', $this->record)
                ->schema([
                    Textarea::make('reason')
                        ->label(__('core::onboarding.admin.decline_reason'))
                        ->required()
                        ->maxLength(2000)
                        ->rows(4),
                ])
                ->action(fn (array $data) => $this->review(
                    fn (OnboardingReviewService $service, User $reviewer) => $service->decline($this->record, $reviewer, $data['reason']),
                    __('core::onboarding.admin.declined'),
                )),
        ];
    }

    /**
     * @param  callable(OnboardingReviewService, User): void  $callback
     */
    private function review(callable $callback, string $successTitle): void
    {
        /** @var User $reviewer */
        $reviewer = auth()->user();

        try {
            $callback(app(OnboardingReviewService::class), $reviewer);

            Notification::make()->title($successTitle)->success()->send();
        } catch (DomainException $exception) {
            Notification::make()->title($exception->getMessage())->danger()->send();
        }

        $this->record->refresh();
        $this->redirect(static::getResource()::getUrl('view', ['record' => $this->record]));
    }
}
