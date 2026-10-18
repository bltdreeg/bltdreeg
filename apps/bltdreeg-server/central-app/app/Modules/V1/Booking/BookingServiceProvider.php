<?php

namespace App\Modules\V1\Booking;

use App\Modules\V1\Booking\Console\StartDueSlotsCommand;
use Bltdreeg\Core\Modules\Queue\Support\QueueEngine;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

class BookingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(QueueEngine::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/routes/api.php');

        if ($this->app->runningInConsole()) {
            $this->commands([StartDueSlotsCommand::class]);
        }

        $this->callAfterResolving(Schedule::class, function (Schedule $schedule) {
            $schedule->command('booking:start-due-slots')->everyMinute()->withoutOverlapping();
        });
    }
}
