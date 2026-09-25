<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Auth\Support;

/**
 * Canonical Filament Shield permission names used by policies.
 *
 * Split into Central vs tenant vocabularies so salon roles never receive
 * landlord permissions, and dead SoftDelete/Replicate/Reorder affixes are gone.
 */
final class ShieldPermissions
{
    /**
     * @var list<string>
     */
    private const CENTRAL_SUBJECTS = [
        'Tenant',
        'User',
        'CatalogJobType',
        'CatalogService',
        'CatalogServiceCategory',
        'TenantOnboardingSubmission',
    ];

    /**
     * @var list<string>
     */
    private const TENANT_SUBJECTS = [
        'User',
        'Role',
        'Branch',
        'JobType',
        'Service',
        'ServiceCategory',
        'Shift',
        'EmployeeAttendance',
        'EmployeeAdjustment',
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
    ];

    /**
     * @var list<string>
     */
    private const TENANT_CUSTOM = [
        'Import:JobType',
        'Import:Service',
        'Import:ServiceCategory',
        'CheckIn:EmployeeAttendance',
        'CheckOut:EmployeeAttendance',
        'Approve:EmployeeAdjustment',
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
    public static function central(): array
    {
        return self::expand(self::CENTRAL_SUBJECTS);
    }

    /**
     * @return list<string>
     */
    public static function tenant(): array
    {
        return array_values(array_unique([
            ...self::expand(self::TENANT_SUBJECTS),
            ...self::TENANT_CUSTOM,
        ]));
    }

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return array_values(array_unique([
            ...self::central(),
            ...self::tenant(),
        ]));
    }

    /**
     * @deprecated Use all() / central() / tenant()
     *
     * @return list<string>
     */
    public static function names(): array
    {
        return self::all();
    }

    /**
     * @param  list<string>  $subjects
     * @return list<string>
     */
    private static function expand(array $subjects): array
    {
        $names = [];

        foreach ($subjects as $subject) {
            foreach (self::STANDARD_AFFIXES as $affix) {
                $names[] = "{$affix}:{$subject}";
            }
        }

        return $names;
    }
}
