<?php

use App\Modules\V1\Booking\Http\Controllers\BranchBarbersController;
use App\Modules\V1\Booking\Http\Controllers\ChairSlotsController;
use App\Modules\V1\Booking\Http\Controllers\ReservationsController;
use App\Modules\V1\Customer\Auth\Http\Middleware\SetApiLocale;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1')
    ->middleware([SetApiLocale::class])
    ->group(function () {
        // عام: الحلاقين المتاحين ومواعيد الدخول — الزائر يتصفح من غير حساب
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('branches/{branch}/barbers', BranchBarbersController::class)->whereNumber('branch');
            Route::get('branches/{branch}/chairs/{chair}/slots', ChairSlotsController::class)
                ->whereNumber('branch')
                ->whereNumber('chair');
        });

        // الحجز محتاج حساب مكمّل الـ onboarding
        Route::middleware(['auth:customer', 'customer.extend_token', 'customer.onboarded'])
            ->prefix('reservations')
            ->group(function () {
                Route::get('', [ReservationsController::class, 'index']);
                Route::post('', [ReservationsController::class, 'store'])->middleware('throttle:20,1');
                Route::get('{reservation}', [ReservationsController::class, 'show'])->whereNumber('reservation');
                Route::post('{reservation}/cancel', [ReservationsController::class, 'cancel'])->whereNumber('reservation');
            });
    });
