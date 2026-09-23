<?php

namespace App\Modules\V1\Onboarding\Livewire;

use BezhanSalleh\LanguageSwitch\LanguageSwitch;
use Illuminate\Contracts\View\View;
use Livewire\Component;

class LocaleToggle extends Component
{
    public function switchLocale(string $locale): void
    {
        if (! in_array($locale, ['ar', 'en'], true)) {
            return;
        }

        LanguageSwitch::switchLocale(locale: $locale);

        $this->redirect(request()->header('Referer', url()->current()));
    }

    public function render(): View
    {
        $current = app()->getLocale();

        return view('livewire.locale-toggle', [
            'current' => $current,
            'target' => $current === 'ar' ? 'en' : 'ar',
            'label' => $current === 'ar' ? 'English' : 'العربية',
        ]);
    }
}
