<?php

namespace Bltdreeg\Core\Support;

final class TenantPermissions
{
    /**
     * @var list<string>
     */
    public const CRUD_ACTIONS = ['index', 'view', 'create', 'update', 'delete'];

    /**
     * Resource => extra actions merged onto CRUD (same map style as ATS).
     *
     * @var array<string, list<string>>
     */
    public const MAP = [
        'employees' => [],
        'roles' => ['assign', 'bulk-delete', 'bulk-duplicate'],
        'job-types' => ['import'],
        'services' => ['import'],
        'categories' => ['import'],
    ];

    /**
     * @var array<string, string>
     */
    private const RESOURCE_LABELS = [
        'employees' => 'Employees',
        'roles' => 'Roles',
        'job-types' => 'Job types',
        'services' => 'Services',
        'categories' => 'Categories',
    ];

    /**
     * @return array<string, array{label: string, options: array<string, string>}>
     */
    public static function groupedByResource(): array
    {
        $groups = [];

        foreach (self::MAP as $resource => $customActions) {
            $options = [];

            foreach ([...self::CRUD_ACTIONS, ...$customActions] as $action) {
                $name = "{$resource}.{$action}";
                $options[$name] = $name;
            }

            $groups[$resource] = [
                'label' => self::RESOURCE_LABELS[$resource] ?? $resource,
                'options' => $options,
            ];
        }

        return $groups;
    }

    /**
     * @return array<string, array<string, string>>
     */
    public static function groups(): array
    {
        $groups = [];

        foreach (self::groupedByResource() as $group) {
            $groups[$group['label']] = $group['options'];
        }

        return $groups;
    }

    /**
     * @return list<string>
     */
    public static function names(): array
    {
        return array_keys(self::options());
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        $options = [];

        foreach (self::groups() as $permissions) {
            $options = [...$options, ...$permissions];
        }

        return $options;
    }

    /**
     * @return list<string>
     */
    public static function namesForResource(string $resource): array
    {
        $custom = self::MAP[$resource] ?? [];

        return array_map(
            fn (string $action): string => "{$resource}.{$action}",
            [...self::CRUD_ACTIONS, ...$custom],
        );
    }
}
