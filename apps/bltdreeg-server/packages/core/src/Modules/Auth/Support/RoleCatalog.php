<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Auth\Support;

use Bltdreeg\Core\Modules\Auth\Models\Permission;
use Bltdreeg\Core\Modules\Auth\Models\RoleTemplate;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantProvisioner;

/**
 * Central-owned role templates, seeded like Catalog.
 */
class RoleCatalog
{
    public static function seed(): void
    {
        app(TenantProvisioner::class)->ensurePermissions();

        foreach (self::definitions() as $definition) {
            $template = RoleTemplate::query()->firstOrCreate(
                ['name' => $definition['name']],
                [
                    'description' => $definition['description'],
                    'is_active' => true,
                ],
            );

            $permissionIds = Permission::query()
                ->whereIn('name', $definition['permissions'])
                ->pluck('id');

            $template->permissions()->sync($permissionIds);
        }
    }

    /**
     * @return list<array{name: string, description: string, permissions: list<string>}>
     */
    public static function definitions(): array
    {
        $tenant = ShieldPermissions::tenant();

        $exceptRole = array_values(array_filter(
            $tenant,
            fn (string $name): bool => ! str_ends_with($name, ':Role') && ! str_starts_with($name, 'Import:'),
        ));

        $viewOnly = array_values(array_filter(
            $tenant,
            fn (string $name): bool => str_starts_with($name, 'ViewAny:') || str_starts_with($name, 'View:'),
        ));

        return [
            [
                'name' => 'Salon manager',
                'description' => 'Everything tenant-side except Role management',
                'permissions' => $exceptRole,
            ],
            [
                'name' => 'Receptionist',
                'description' => 'Front desk: view catalog entities and check attendance in/out',
                'permissions' => [
                    'ViewAny:Branch',
                    'View:Branch',
                    'ViewAny:Service',
                    'View:Service',
                    'ViewAny:ServiceCategory',
                    'View:ServiceCategory',
                    'ViewAny:EmployeeAttendance',
                    'View:EmployeeAttendance',
                    'CheckIn:EmployeeAttendance',
                    'CheckOut:EmployeeAttendance',
                ],
            ],
            [
                'name' => 'Stylist',
                'description' => 'Own attendance plus service view',
                'permissions' => [
                    'ViewAny:Service',
                    'View:Service',
                    'ViewAny:EmployeeAttendance',
                    'View:EmployeeAttendance',
                    'CheckIn:EmployeeAttendance',
                    'CheckOut:EmployeeAttendance',
                ],
            ],
            [
                'name' => 'Accountant',
                'description' => 'Read-only across the tenant',
                'permissions' => $viewOnly,
            ],
        ];
    }
}
