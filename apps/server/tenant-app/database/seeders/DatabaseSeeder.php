<?php

namespace Database\Seeders;

use App\Models\User;
use Bltdreeg\Core\Models\Team;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;
use VentureDrake\LaravelCrm\Database\Seeders\LaravelCrmTablesSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(LaravelCrmTablesSeeder::class);

        $registrar = app(PermissionRegistrar::class);

        foreach (Team::with('owner')->get() as $team) {
            if (! $owner = $team->owner) {
                continue;
            }

            $registrar->setPermissionsTeamId($team->getKey());
            User::find($owner->getKey())?->assignRole('Owner');
        }

        $registrar->setPermissionsTeamId(null);
    }
}
