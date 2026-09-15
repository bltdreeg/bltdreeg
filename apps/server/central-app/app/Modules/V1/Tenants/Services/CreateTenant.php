<?php

namespace App\Modules\V1\Tenants\Services;

use Bltdreeg\Core\Models\Team;
use Bltdreeg\Core\Models\User;
use Illuminate\Support\Facades\DB;

class CreateTenant
{
    public function handle(string $name, string $slug, User $owner): Team
    {
        return DB::transaction(function () use ($name, $slug, $owner) {
            $team = Team::create([
                'name' => $name,
                'slug' => $slug,
                'owner_id' => $owner->getKey(),
            ]);

            $team->users()->syncWithoutDetaching([$owner->getKey() => ['role' => 'owner']]);
            $owner->forceFill(['current_team_id' => $team->getKey()])->save();

            return $team;
        });
    }
}
