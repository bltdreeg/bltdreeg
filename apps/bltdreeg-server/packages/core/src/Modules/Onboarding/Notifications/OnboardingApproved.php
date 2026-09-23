<?php

namespace Bltdreeg\Core\Modules\Onboarding\Notifications;

use Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OnboardingApproved extends Notification
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
            ->subject(__('core::onboarding.mail.approved.subject'))
            ->line(__('core::onboarding.mail.approved.body', ['salon' => $tenant?->name]));
    }
}
