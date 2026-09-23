<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Tenancy\Support;

use Bltdreeg\Core\Modules\Auth\Models\RoleTemplate;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Auth\Support\RoleTemplateImporter;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Bltdreeg\Core\Modules\Catalog\Support\CatalogImporter;
use Bltdreeg\Core\Modules\Hr\Enums\SalaryTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Hr\Models\Shift;
use Bltdreeg\Core\Modules\Onboarding\Enums\TeamSizeEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Support\Str;

/**
 * Starter data for a salon, run once its onboarding is approved (never at registration,
 * so declined salons leave nothing behind). Safe to run more than once.
 */
class TenantSeeder
{
    public const BARBER_JOB_TYPE = 'Barber';

    public const STARTER_ROLE_TEMPLATES = ['Salon manager', 'Receptionist'];

    /**
     * @var list<array{name: string, job_type: string, salary: int}>
     */
    private const EXAMPLE_EMPLOYEES = [
        ['name' => 'عاطف', 'job_type' => self::BARBER_JOB_TYPE, 'salary' => 6000],
        ['name' => 'منى', 'job_type' => 'Receptionist', 'salary' => 4500],
    ];

    public function __construct(
        private CatalogImporter $catalogImporter,
        private RoleTemplateImporter $roleTemplateImporter,
    ) {}

    public function seed(Tenant $tenant): void
    {
        $this->catalogImporter->importCatalog($tenant);
        $this->importStarterRoles($tenant);

        $branch = Branch::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenant->getKey())
            ->orderBy('id')
            ->first();

        if (! $branch) {
            return;
        }

        $shift = $this->ensureDefaultShift($tenant);
        $count = ($branch->team_size ?? TeamSizeEnum::SMALL)->exampleEmployeeCount();

        foreach (array_slice(self::EXAMPLE_EMPLOYEES, 0, max(1, $count)) as $index => $employee) {
            $this->ensureExampleEmployee($tenant, $branch, $shift, $employee, $index + 1);
        }
    }

    private function importStarterRoles(Tenant $tenant): void
    {
        RoleTemplate::query()
            ->whereIn('name', self::STARTER_ROLE_TEMPLATES)
            ->where('is_active', true)
            ->each(fn (RoleTemplate $template) => $this->roleTemplateImporter->importTemplate($template, $tenant));
    }

    private function ensureDefaultShift(Tenant $tenant): Shift
    {
        return Shift::query()->withoutGlobalScopes()->firstOrCreate(
            ['tenant_id' => $tenant->getKey(), 'name' => 'Morning'],
            ['start_time' => '09:00:00', 'end_time' => '17:00:00', 'break_minutes' => 60, 'is_active' => true],
        );
    }

    private function jobType(Tenant $tenant, string $name): JobType
    {
        $catalog = CatalogJobType::query()->where('name', $name)->first();

        if ($catalog) {
            return $this->catalogImporter->importJobType($catalog, $tenant);
        }

        return JobType::query()->withoutGlobalScopes()->firstOrCreate(
            ['tenant_id' => $tenant->getKey(), 'name' => $name],
            ['is_active' => true],
        );
    }

    /**
     * @param  array{name: string, job_type: string, salary: int}  $employee
     */
    private function ensureExampleEmployee(Tenant $tenant, Branch $branch, Shift $shift, array $employee, int $number): void
    {
        $phone = 'example-'.$tenant->getKey().'-'.$number;
        $jobType = $this->jobType($tenant, $employee['job_type']);

        $user = User::query()->firstOrCreate(
            ['phone' => $phone],
            [
                'name' => $employee['name'],
                'email' => null,
                'password' => Str::random(40),
                'branch_id' => $branch->getKey(),
                'start_date' => now()->toDateString(),
                'salary_type' => SalaryTypeEnum::MONTHLY->value,
                'salary' => $employee['salary'],
                'is_active' => true,
                'is_super_admin' => false,
            ],
        );

        if (! $user->belongsToTenant($tenant)) {
            $user->tenants()->attach($tenant->getKey(), [
                'job_type_id' => $jobType->getKey(),
                'shift_id' => $shift->getKey(),
            ]);
        }
    }
}
