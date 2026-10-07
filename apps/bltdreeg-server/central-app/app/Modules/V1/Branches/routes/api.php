<?php

use App\Modules\V1\Branches\Http\Controllers\NearbyBranchesController;
use App\Modules\V1\Customer\Auth\Http\Middleware\SetApiLocale;
use Illuminate\Support\Facades\Route;

// عام للزوار: مرتّب بالمسافة من موقعهم (أو الـ IP) فمفيش cache مشترك
Route::prefix('api/v1/branches')
    ->middleware([SetApiLocale::class, 'throttle:60,1'])
    ->group(function () {
        Route::get('nearby', NearbyBranchesController::class);
    });
