<?php

declare(strict_types=1);

namespace App\Modules\V1\CustomerAuth;

use Illuminate\Support\ServiceProvider;

class CustomerAuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/routes/api.php');
    }
}
