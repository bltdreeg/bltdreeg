<?php

namespace Bltdreeg\Core\Support;

use Bltdreeg\Core\Enums\CurrencyEnum;
use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class DemoData
{
    public static function seed(): void
    {
        Catalog::seed();

        self::ensureSuperAdmin();

        $importer = app(CatalogImporter::class);
        $provisioner = app(TenantProvisioner::class);

        foreach (self::tenants() as $definition) {
            $owner = $definition['owner'];
            unset($definition['owner']);

            $tenant = Tenant::query()->firstOrCreate(
                ['slug' => $definition['slug']],
                $definition,
            );

            $provisioner->provision($tenant);
            $importer->importCatalog($tenant);
            self::ensureOwner($tenant, $owner, $provisioner);
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
    }

    /**
     * @return list<array{
     *     name: string,
     *     slug: string,
     *     email: string,
     *     phone: string,
     *     address: string,
     *     currency: CurrencyEnum,
     *     is_active: bool,
     *     owner: array{name: string, email: string, phone: string}
     * }>
     */
    public static function tenants(): array
    {
        return [
            [
                'name' => 'Bloom Salon',
                'slug' => 'bloom',
                'email' => 'hello@bloom.dev',
                'phone' => '1000000001',
                'address' => '12 Nile Avenue, Cairo',
                'currency' => CurrencyEnum::EGP,
                'is_active' => true,
                'owner' => [
                    'name' => 'Bloom Owner',
                    'email' => 'owner@bloom.dev',
                    'phone' => '1000000101',
                ],
            ],
            [
                'name' => 'Petal Studio',
                'slug' => 'petal',
                'email' => 'hello@petal.dev',
                'phone' => '1000000002',
                'address' => '8 Corniche Road, Alexandria',
                'currency' => CurrencyEnum::EGP,
                'is_active' => true,
                'owner' => [
                    'name' => 'Petal Owner',
                    'email' => 'owner@petal.dev',
                    'phone' => '1000000102',
                ],
            ],
        ];
    }

    private static function ensureSuperAdmin(): User
    {
        $user = User::query()->where('email', 'super@admin.dev')->first();

        if (! $user) {
            return User::query()->create([
                'email' => 'super@admin.dev',
                'password' => 'password',
                'name' => 'Super Admin',
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'phone' => '1234567890',
                'is_active' => true,
                'is_super_admin' => true,
            ]);
        }

        $user->forceFill(['is_active' => true, 'is_super_admin' => true])->save();

        return $user;
    }

    /**
     * @param  array{name: string, email: string, phone: string}  $owner
     */
    private static function ensureOwner(Tenant $tenant, array $owner, TenantProvisioner $provisioner): User
    {
        $user = User::query()->where('email', $owner['email'])->first();

        if ($user) {
            $user->tenants()->syncWithoutDetaching([$tenant->getKey()]);
            $provisioner->assignTenantSuperAdminRole($tenant, $user);

            return $user;
        }

        return $provisioner->createTenantOwner(
            $tenant,
            $owner['name'],
            $owner['email'],
            'password',
            $owner['phone'],
        );
    }
}
