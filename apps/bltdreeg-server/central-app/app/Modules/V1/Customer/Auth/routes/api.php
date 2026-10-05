<?php

use App\Modules\V1\Customer\Auth\Http\Controllers\AuthOptionsController;
use App\Modules\V1\Customer\Auth\Http\Controllers\LogoutController;
use App\Modules\V1\Customer\Auth\Http\Controllers\MeController;
use App\Modules\V1\Customer\Auth\Http\Controllers\MeEmailController;
use App\Modules\V1\Customer\Auth\Http\Controllers\MeLocationController;
use App\Modules\V1\Customer\Auth\Http\Controllers\MePasswordController;
use App\Modules\V1\Customer\Auth\Http\Controllers\MePhoneController;
use App\Modules\V1\Customer\Auth\Http\Controllers\OtpController;
use App\Modules\V1\Customer\Auth\Http\Controllers\PasswordLoginController;
use App\Modules\V1\Customer\Auth\Http\Controllers\PasswordResetController;
use App\Modules\V1\Customer\Auth\Http\Controllers\RegisterController;
use App\Modules\V1\Customer\Auth\Http\Controllers\SocialLoginController;
use App\Modules\V1\Customer\Auth\Http\Middleware\ExtendCustomerToken;
use App\Modules\V1\Customer\Auth\Http\Middleware\SetApiLocale;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1')
    ->middleware([
        SetApiLocale::class,
    ])
    ->group(function () {
        // Public Auth Endpoints
        Route::prefix('auth')->group(function () {
            Route::get('options', AuthOptionsController::class);
            Route::post('register', RegisterController::class);
            Route::post('login', PasswordLoginController::class)->middleware('throttle:customer-login');
            Route::post('otp', [OtpController::class, 'send'])->middleware('throttle:customer-otp-ip');
            Route::post('otp/resend', [OtpController::class, 'resend'])->middleware('throttle:customer-otp-ip');
            Route::post('otp/verify', [OtpController::class, 'verify']);
            Route::post('social/{provider}', SocialLoginController::class);
            Route::post('password/forgot', [PasswordResetController::class, 'forgot']);
            Route::post('password/verify', [PasswordResetController::class, 'verifyCode']);
            Route::post('password/reset', [PasswordResetController::class, 'reset']);
        });

        // Authenticated Customer Endpoints
        Route::middleware([
            'auth:customer',
            ExtendCustomerToken::class,
        ])->group(function () {
            Route::post('auth/logout', LogoutController::class);

            Route::get('me', [MeController::class, 'show']);
            Route::put('me', [MeController::class, 'update']);
            Route::delete('me', [MeController::class, 'destroy']);

            Route::put('me/password', [MePasswordController::class, 'update']);
            Route::post('me/phone', [MePhoneController::class, 'send']);
            Route::post('me/phone/verify', [MePhoneController::class, 'verify']);
            Route::post('me/email/resend', [MeEmailController::class, 'resend']);
            Route::post('me/email/verify', [MeEmailController::class, 'verify']);
            Route::get('me/location/estimate', [MeLocationController::class, 'estimate']);
            Route::put('me/location', [MeLocationController::class, 'update']);
        });
    });
