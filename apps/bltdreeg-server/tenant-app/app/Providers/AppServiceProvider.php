<?php

namespace App\Providers;

use BezhanSalleh\LanguageSwitch\Enums\TriggerStyle;
use BezhanSalleh\LanguageSwitch\LanguageSwitch;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::before(function ($user) {
            if ($user instanceof User && $user->is_super_admin) {
                return true;
            }

            return null;
        });

        LanguageSwitch::configureUsing(function (LanguageSwitch $switch) {
            $switch
                ->locales(['ar', 'en'])
                ->displayLocale('ar')
                // Arabic unless the user switched manually; otherwise the browser's Accept-Language wins.
                ->userPreferredLocale(fn (): string => config('app.locale'))
                // Floating switch on auth only; onboarding pages use the navbar LocaleToggle.
                ->visible(insidePanels: true, outsidePanels: true)
                ->outsidePanelRoutes([
                    'auth.login',
                    'auth.register',
                ]);

            $switch->trigger(style: TriggerStyle::Icon);
            $switch->trigger(style: TriggerStyle::Flag);
            $switch->trigger(style: TriggerStyle::Avatar);
        });
    }
}
