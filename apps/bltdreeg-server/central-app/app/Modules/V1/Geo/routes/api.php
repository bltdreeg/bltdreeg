<?php

use App\Modules\V1\Customer\Auth\Http\Middleware\SetApiLocale;
use App\Modules\V1\Geo\Http\Controllers\GeoDivisionsController;
use App\Modules\V1\Geo\Http\Controllers\GeoResolveController;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/geo')
    ->middleware([SetApiLocale::class, SubstituteBindings::class])
    ->group(function () {
        Route::middleware('cache.headers:public;max_age=86400;etag')->group(function () {
            Route::get('governorates', [GeoDivisionsController::class, 'governorates']);
            Route::get('governorates/{governorate}/cities', [GeoDivisionsController::class, 'cities']);
            Route::get('cities/{city}/areas', [GeoDivisionsController::class, 'areas']);
        });

        Route::get('resolve', GeoResolveController::class)->middleware('throttle:60,1');
    });
