<?php

namespace Bltdreeg\Core\Modules\Onboarding\Notifications;

use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OnboardingSubmitted extends Notification
{
    use Queueable;

    public function __construct(public TenantOnboardingSubmission $submission) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tenant = $this->submission->tenant()->withoutGlobalScopes()->first();

        return (new MailMessage)
            ->subject(__('core::onboarding.mail.submitted.subject', ['salon' => $tenant?->name]))
            ->line(__('core::onboarding.mail.submitted.body', [
                'salon' => $tenant?->name,
                'revision' => $this->submission->revision,
            ]));
    }
}
