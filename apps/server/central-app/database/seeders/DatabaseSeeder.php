<?php

namespace Database\Seeders;

use App\Modules\V1\Tenants\Services\CreateTenant;
use Bltdreeg\Core\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bltdreeg.test'],
            ['name' => 'Landlord Admin', 'password' => 'password', 'is_super_admin' => true],
        );

        $createTenant = app(CreateTenant::class);

        foreach ([['Acme Inc', 'acme'], ['Globex', 'globex']] as [$name, $slug]) {
            $owner = User::firstOrCreate(
                ['email' => "owner@{$slug}.test"],
                ['name' => "{$name} Owner", 'password' => 'password'],
            );

            if ($owner->ownedTeams()->where('slug', $slug)->doesntExist()) {
                $createTenant->handle($name, $slug, $owner);
            }
        }

        $this->command?->info("Landlord: {$admin->email} / password");
    }
}
