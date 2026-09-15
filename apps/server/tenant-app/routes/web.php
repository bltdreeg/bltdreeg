<?php

use Dcblogdev\Xero\Facades\Xero;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Route;

/*
| Filament's Integrations page names these routes, but laravel-crm only
| registers them when LARAVEL_CRM_USER_INTERFACE=true. We keep the Livewire
| UI off and provide the named endpoints the Filament page needs.
*/
Route::middleware(['web', 'auth'])->prefix('crm/integrations')->group(function () {
    Route::get('xero', function () {
        $tenant = Filament::getTenant();

        if ($tenant) {
            return redirect()->route('filament.app.pages.integrations', ['tenant' => $tenant]);
        }

        return redirect('/');
    })->name('laravel-crm.integrations.xero');

    Route::get('xero/connect', function () {
        return Xero::connect();
    })->name('laravel-crm.integrations.xero.connect');

    Route::get('xero/disconnect', function () {
        try {
            if (Xero::isConnected()) {
                Xero::disconnect();
            }
        } catch (\Throwable) {
            // Xero may be unconfigured; still leave the Integrations page.
        }

        $tenant = Filament::getTenant();

        if ($tenant) {
            return redirect()->route('filament.app.pages.integrations', ['tenant' => $tenant]);
        }

        return redirect()->to(url()->previous() ?: '/');
    })->name('laravel-crm.integrations.xero.disconnect');
});
