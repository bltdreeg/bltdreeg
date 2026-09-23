@php
    use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
    use Bltdreeg\Core\Modules\Onboarding\Support\LegalTerms;

    $tenant = \Filament\Facades\Filament::getTenant();
    $submission = \Bltdreeg\Core\Modules\Onboarding\Models\TenantOnboardingSubmission::query()
        ->where('tenant_id', $tenant->getKey())
        ->orderByDesc('revision')
        ->first();
    $revision = $submission?->revision ?? 1;
    $isDeclined = $tenant->statusIs(TenantStatusEnum::DECLINED);
@endphp

<div class="fi-onboarding-status">
    <div class="fi-onboarding-status-card">
        <div @class([
            'fi-onboarding-status-banner',
            'is-pending' => ! $isDeclined,
            'is-declined' => $isDeclined,
        ])>
            <p class="fi-onboarding-status-eyebrow">
                {{ __('core::onboarding.status_page.title') }}
            </p>
            <h1 class="fi-onboarding-status-heading">
                {{ $isDeclined
                    ? __('core::onboarding.status_page.declined_heading')
                    : __('core::onboarding.status_page.pending_heading') }}
            </h1>
        </div>

        <div class="fi-onboarding-status-body">
            <p class="fi-onboarding-status-copy">
                {{ $isDeclined
                    ? __('core::onboarding.status_page.declined_body', ['revision' => $revision])
                    : __('core::onboarding.status_page.pending_body', ['revision' => $revision]) }}
            </p>

            @if ($isDeclined && filled($submission?->decline_reason))
                <div class="fi-onboarding-status-reason">
                    {{ $submission->decline_reason }}
                </div>
            @endif

            <div class="fi-onboarding-status-actions">
                @if ($isDeclined)
                    <a
                        href="{{ \App\Modules\V1\Onboarding\Filament\Pages\Onboarding::getUrl(tenant: $tenant) }}"
                        class="fi-btn fi-btn-color-primary fi-size-md fi-btn-primary"
                    >
                        {{ __('core::onboarding.status_page.resubmit') }}
                    </a>
                @endif

                <a
                    href="{{ LegalTerms::homeUrl() }}"
                    class="fi-btn fi-btn-color-gray fi-size-md fi-btn-outlined"
                >
                    {{ __('core::onboarding.status_page.browse_marketplace') }}
                </a>
            </div>
        </div>
    </div>
</div>
