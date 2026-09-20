<?php

namespace App\Providers;

use BezhanSalleh\LanguageSwitch\Enums\TriggerStyle;
use BezhanSalleh\LanguageSwitch\LanguageSwitch;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        LanguageSwitch::configureUsing(function (LanguageSwitch $switch) {
            $switch->locales(['en', 'ar']);

            $switch->trigger(style: TriggerStyle::Icon);
            $switch->trigger(style: TriggerStyle::Flag);
            $switch->trigger(style: TriggerStyle::Avatar);
        });
    }
}
