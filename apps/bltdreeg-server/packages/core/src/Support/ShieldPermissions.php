<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Support;

/**
 * Canonical Filament Shield permission names used by policies.
 *
 * Seeded during tenant provisioning so authorization works without a manual
 * `shield:generate` run, and so existing environments can migrate off the
 * legacy `resource.action` permission names.
 */
final class ShieldPermissions
{
    /**
     * @var list<string>
     */
    private const SUBJECTS = [
        'User',
        'Role',
        'Branch',
        'JobType',
        'Service',
        'ServiceCategory',
        'Shift',
        'EmployeeAttendance',
        'Tenant',
        'CatalogJobType',
        'CatalogService',
        'CatalogServiceCategory',
    ];

    /**
     * @var list<string>
     */
    private const STANDARD_AFFIXES = [
        'ViewAny',
        'View',
        'Create',
        'Update',
        'Delete',
        'DeleteAny',
        'Restore',
        'ForceDelete',
        'ForceDeleteAny',
        'RestoreAny',
        'Replicate',
        'Reorder',
    ];

    /**
     * @var list<string>
     */
    private const CUSTOM = [
        'Import:JobType',
        'Import:Service',
        'Import:ServiceCategory',
        'CheckIn:EmployeeAttendance',
        'CheckOut:EmployeeAttendance',
    ];

    /**
     * Legacy Spatie permission name => Shield permission name.
     *
     * @var array<string, string>
     */
    public const LEGACY_MAP = [
        'employees.index' => 'ViewAny:User',
        'employees.view' => 'View:User',
        'employees.create' => 'Create:User',
        'employees.update' => 'Update:User',
        'employees.delete' => 'Delete:User',
        'roles.index' => 'ViewAny:Role',
        'roles.view' => 'View:Role',
        'roles.create' => 'Create:Role',
        'roles.update' => 'Update:Role',
        'roles.delete' => 'Delete:Role',
        'roles.assign' => 'Update:Role',
        'roles.bulk-delete' => 'DeleteAny:Role',
        'roles.bulk-duplicate' => 'Replicate:Role',
        'job-types.index' => 'ViewAny:JobType',
        'job-types.view' => 'View:JobType',
        'job-types.create' => 'Create:JobType',
        'job-types.update' => 'Update:JobType',
        'job-types.delete' => 'Delete:JobType',
        'job-types.import' => 'Import:JobType',
        'services.index' => 'ViewAny:Service',
        'services.view' => 'View:Service',
        'services.create' => 'Create:Service',
        'services.update' => 'Update:Service',
        'services.delete' => 'Delete:Service',
        'services.import' => 'Import:Service',
        'categories.index' => 'ViewAny:ServiceCategory',
        'categories.view' => 'View:ServiceCategory',
        'categories.create' => 'Create:ServiceCategory',
        'categories.update' => 'Update:ServiceCategory',
        'categories.delete' => 'Delete:ServiceCategory',
        'categories.import' => 'Import:ServiceCategory',
        'branches.index' => 'ViewAny:Branch',
        'branches.view' => 'View:Branch',
        'branches.create' => 'Create:Branch',
        'branches.update' => 'Update:Branch',
        'branches.delete' => 'Delete:Branch',
    ];

    /**
     * @return list<string>
     */
    public static function names(): array
    {
        $names = [];

        foreach (self::SUBJECTS as $subject) {
            foreach (self::STANDARD_AFFIXES as $affix) {
                $names[] = "{$affix}:{$subject}";
            }
        }

        return array_values(array_unique([...$names, ...self::CUSTOM]));
    }
}
