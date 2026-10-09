<?php

use App\Modules\V1\Branches\Http\Controllers\NearbyBranchesController;
use App\Modules\V1\Customer\Auth\Http\Middleware\SetApiLocale;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/branches')
    ->middleware([SetApiLocale::class, 'throttle:60,1'])
    ->group(function () {
        Route::get('nearby', NearbyBranchesController::class);
    });
Route::get('', NearbyBranchesController::class);