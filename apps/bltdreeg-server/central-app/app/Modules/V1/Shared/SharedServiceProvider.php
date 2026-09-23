<?php

declare(strict_types=1);

namespace App\Modules\V1\Shared;

use App\Modules\V1\Shared\Http\Controllers\PrivateFileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class SharedServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Route::middleware('web')->group(function (): void {
            Route::get('/private-files/{type}/{id}', PrivateFileController::class)
                ->middleware('signed')
                ->where('type', '[a-z0-9\-]+')
                ->name('private-files.show');
        });
    }
}
