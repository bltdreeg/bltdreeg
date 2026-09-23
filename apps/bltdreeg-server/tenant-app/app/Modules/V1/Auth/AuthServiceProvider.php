<?php

declare(strict_types=1);

namespace App\Modules\V1\Auth;

use App\Modules\V1\Auth\Filament\Http\Responses\RegistrationResponse;
use Filament\Auth\Http\Responses\Contracts\RegistrationResponse as RegistrationResponseContract;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(
            RegistrationResponseContract::class,
            RegistrationResponse::class,
        );
    }

    public function boot(): void
    {
        //
    }
}
