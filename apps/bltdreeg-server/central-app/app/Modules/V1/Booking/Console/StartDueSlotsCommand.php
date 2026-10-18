<?php

namespace App\Modules\V1\Booking\Console;

use Bltdreeg\Core\Modules\Queue\Support\QueueEngine;
use Illuminate\Console\Command;

class StartDueSlotsCommand extends Command
{
    protected $signature = 'booking:start-due-slots';

    protected $description = 'Move slot holders whose slot has started into the chair queue';

    public function handle(QueueEngine $engine): int
    {
        $count = $engine->startDueSlots();
        $this->info("Processed {$count} slot reservation(s).");

        return self::SUCCESS;
    }
}
