<?php

declare(strict_types=1);

namespace App\Modules\V1\Branches;

use Illuminate\Support\ServiceProvider;

class BranchesServiceProvider extends ServiceProvider
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
