<?php

namespace App\Providers;

use BezhanSalleh\LanguageSwitch\Enums\TriggerStyle;
use BezhanSalleh\LanguageSwitch\LanguageSwitch;
use Bltdreeg\Core\Modules\Auth\Models\Permission;
use Bltdreeg\Core\Modules\Auth\Models\Role;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\PermissionRegistrar;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        app(PermissionRegistrar::class)
            ->setPermissionClass(Permission::class)
            ->setRoleClass(Role::class);

        Gate::before(fn ($user): ?bool => $user?->is_super_admin ? true : null);

        LanguageSwitch::configureUsing(function (LanguageSwitch $switch) {
            $switch->locales(['en', 'ar']);

            $switch->trigger(style: TriggerStyle::Icon);
            $switch->trigger(style: TriggerStyle::Flag);
            $switch->trigger(style: TriggerStyle::Avatar);
        });
    }
}
