<?php

namespace App\Modules\V1\Geo;

use App\Modules\V1\Geo\Console\GeoSyncCommand;
use Illuminate\Support\ServiceProvider;

class GeoServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/routes/api.php');

        if ($this->app->runningInConsole()) {
            $this->commands([GeoSyncCommand::class]);
        }
    }
}
