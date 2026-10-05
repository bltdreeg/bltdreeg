<?php

namespace App\Modules\V1\Customer\Auth\Console;

use App\Modules\V1\Customer\Auth\Models\OtpChallenge;
use Illuminate\Console\Command;

class PruneOtpChallengesCommand extends Command
{
    protected $signature = 'customer-auth:prune-otp';

    protected $description = 'Delete consumed and expired OTP challenges';

    public function handle(): int
    {
        $count = OtpChallenge::query()
            ->where(function ($query) {
                $query->whereNotNull('consumed_at')
                    ->orWhere('expires_at', '<', now()->subDay());
            })
            ->where(fn ($query) => $query->whereNull('locked_until')->orWhere('locked_until', '<', now()))
            ->delete();

        $this->info("Pruned {$count} OTP challenges.");

        return self::SUCCESS;
    }
}
