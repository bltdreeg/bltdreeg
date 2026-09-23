<?php

namespace Bltdreeg\Core\Modules\Tenancy\Support;

use Bltdreeg\Core\Modules\Auth\Models\RoleTemplate;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Auth\Support\RoleCatalog;
use Bltdreeg\Core\Modules\Auth\Support\RoleTemplateImporter;
use Bltdreeg\Core\Modules\Catalog\Support\Catalog;
use Bltdreeg\Core\Modules\Catalog\Support\CatalogImporter;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Support\Str;

class DemoData
{
    public static function seed(): void
    {
        Catalog::seed();
        RoleCatalog::seed();

        self::ensureSuperAdmin();

        $importer = app(CatalogImporter::class);
        $roleImporter = app(RoleTemplateImporter::class);
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
            $ownerUser = self::ensureOwner($tenant, $owner, $provisioner);
            self::seedTenantBranches($tenant);
            // Owners stay branch-free so they can switch among all tenant branches.
            $ownerUser->forceFill(['branch_id' => null])->save();

            self::importDemoRoles($tenant, $roleImporter);
        }
    }

    private static function importDemoRoles(Tenant $tenant, RoleTemplateImporter $importer): void
    {
        $templates = RoleTemplate::query()
            ->whereIn('name', ['Salon manager', 'Receptionist'])
            ->where('is_active', true)
            ->get();

        foreach ($templates as $template) {
            $role = $importer->importTemplate($template, $tenant);

            $email = Str::slug($template->name).'@'.$tenant->slug.'.dev';
            $user = User::query()->where('email', $email)->first();

            if (! $user) {
                $user = User::query()->create([
                    'name' => $template->name.' ('.$tenant->name.')',
                    'email' => $email,
                    'password' => 'password',
                    'phone' => '9'.substr(md5($email), 0, 9),
                    'is_active' => true,
                    'is_super_admin' => false,
                    'email_verified_at' => now(),
                ]);
            }

            $user->tenants()->syncWithoutDetaching([$tenant->getKey()]);
            $user->syncRoles([$role]);
        }
    }

    private static function seedTenantBranches(Tenant $tenant): void
    {
        foreach ([
            [
                'name' => ['en' => 'Downtown', 'ar' => 'وسط البلد'],
                'phone' => '2000000001',
                'address' => ['en' => '1 Main Street, Cairo', 'ar' => '١ شارع رئيسي، القاهرة'],
            ],
            [
                'name' => ['en' => 'Old Town', 'ar' => 'المدينة القديمة'],
                'phone' => '2000000002',
                'address' => ['en' => '5 Old Market, Giza', 'ar' => '٥ سوق قديم، الجيزة'],
            ],
        ] as $branch) {
            $alreadySeeded = Branch::query()
                ->where('tenant_id', $tenant->id)
                ->where('name->en', $branch['name']['en'])
                ->exists();

            if ($alreadySeeded) {
                continue;
            }

            Branch::query()->create([
                'tenant_id' => $tenant->id,
                'name' => $branch['name'],
                'phone' => $branch['phone'],
                'address' => $branch['address'],
                'is_active' => true,
            ]);
        }
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
     *     status: TenantStatusEnum,
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
                'status' => TenantStatusEnum::APPROVED,
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
                'status' => TenantStatusEnum::APPROVED,
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
            $provisioner->assignOwnerRole($tenant, $user);

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
