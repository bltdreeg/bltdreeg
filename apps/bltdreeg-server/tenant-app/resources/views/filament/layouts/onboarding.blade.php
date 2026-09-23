@props([
    'after' => null,
    'heading' => null,
    'subheading' => null,
])

@php
    use Bltdreeg\Core\Modules\Onboarding\Support\LegalTerms;
    use Filament\Livewire\SimpleUserMenu;
    use Filament\Support\Enums\Width;
    use Filament\Support\Facades\FilamentView;
    use Filament\View\PanelsRenderHook;

    $livewire ??= null;
    $renderHookScopes = $livewire?->getRenderHookScopes();
    $maxContentWidth ??= (filament()->getSimplePageMaxContentWidth() ?? Width::Large);

    if (is_string($maxContentWidth)) {
        $maxContentWidth = Width::tryFrom($maxContentWidth) ?? $maxContentWidth;
    }

    $brand = filament()->getBrandName() ?: config('app.name', 'Bltdreeg');
    $tenant = filament()->getTenant();
    $tenantName = $tenant?->name;
@endphp

<x-filament-panels::layout.base :livewire="$livewire">
    <div class="fi-simple-layout fi-onboarding-shell">
        <header class="fi-onboarding-navbar">
            <div class="fi-onboarding-navbar-inner">
                <div class="fi-onboarding-navbar-brand">
                    <a href="{{ LegalTerms::homeUrl() }}" class="fi-onboarding-brand-link">
                        {{ $brand }}
                    </a>

                    @if (filled($tenantName))
                        <span class="fi-onboarding-navbar-divider" aria-hidden="true"></span>
                        <span class="fi-onboarding-tenant-name">{{ $tenantName }}</span>
                    @endif
                </div>

                <div class="fi-onboarding-navbar-actions">
                    <a href="{{ LegalTerms::homeUrl() }}" class="fi-onboarding-nav-link">
                        {{ __('core::onboarding.status_page.browse_marketplace') }}
                    </a>

                    @livewire(\App\Modules\V1\Onboarding\Livewire\LocaleToggle::class)

                    @if (filament()->auth()->check() && filament()->hasUserMenu())
                        <div class="fi-onboarding-user-menu">
                            @livewire(SimpleUserMenu::class)
                        </div>
                    @endif
                </div>
            </div>
        </header>

        {{ FilamentView::renderHook(PanelsRenderHook::SIMPLE_LAYOUT_START, scopes: $renderHookScopes) }}

        <div class="fi-simple-main-ctn fi-onboarding-main-ctn">
            <main
                id="fi-main-content"
                tabindex="-1"
                @class([
                    'fi-simple-main fi-onboarding-main',
                    ($maxContentWidth instanceof Width) ? "fi-width-{$maxContentWidth->value}" : $maxContentWidth,
                ])
            >
                {{ $slot }}
            </main>
        </div>

        {{ FilamentView::renderHook(PanelsRenderHook::FOOTER, scopes: $renderHookScopes) }}
        {{ FilamentView::renderHook(PanelsRenderHook::SIMPLE_LAYOUT_END, scopes: $renderHookScopes) }}
    </div>
</x-filament-panels::layout.base>
