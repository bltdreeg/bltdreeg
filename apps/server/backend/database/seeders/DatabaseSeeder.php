<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::query()->where('is_super_admin', true)->first();

        if (! $user) {
            $user = User::create([
                'email' => 'super@admin.dev',
                'password' => Hash::make('password'),
                'name' => 'Super Admin',
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'phone' => '1234567890',
                'is_active' => true,
                'is_super_admin' => true,
            ]);
        } else {
            $user->forceFill(['is_active' => true, 'is_super_admin' => true])->save();
        }

        foreach (Shop::all() as $shop) {
            $this->grantSuperAdminRole($user, $shop);
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
    }

    /**
     * Assign the tenant-scoped super admin role to the user for a shop.
     */
    private function grantSuperAdminRole(User $user, Shop $shop): void
    {
        app(PermissionRegistrar::class)->setPermissionsTeamId($shop->getKey());

        $role = Role::firstOrCreate([
            'shop_id' => $shop->getKey(),
            'name' => config('filament-shield.super_admin.name', 'super_admin'),
            'guard_name' => 'web',
        ]);

        $role->syncPermissions(Permission::query()->get('id'));

        $user->unsetRelation('roles')->unsetRelation('permissions');
        $user->assignRole($role);
    }
}
