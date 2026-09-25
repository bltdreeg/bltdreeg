<?php

declare(strict_types=1);

use App\Modules\V1\Hr\Filament\Resources\Adjustments\EmployeeAdjustmentResource;
use App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages\CreateAdjustment;
use App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages\ListAdjustments;
use App\Modules\V1\Hr\Filament\Resources\Attendance\EmployeeAttendanceResource;
use App\Modules\V1\Hr\Support\AdjustmentPresenter;
use App\Modules\V1\Hr\Support\EmployeeDirectory;
use Bltdreeg\Core\Modules\Auth\Models\Permission;
use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\EmployeeAdjustment;
use Bltdreeg\Core\Modules\Hr\Models\EmployeeAttendance;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantProvisioner;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

function adjustmentEmployee(Tenant $tenant, ?Branch $branch = null): User
{
    $user = User::factory()->create([
        'is_active' => true,
        'branch_id' => $branch?->getKey(),
    ]);

    $user->tenants()->attach($tenant->id);

    return $user;
}

function adjustmentManager(Tenant $tenant): User
{
    return app(TenantProvisioner::class)->createTenantOwner(
        $tenant,
        'Manager '.$tenant->slug,
        'manager-'.$tenant->slug.'@test.dev',
        'password',
        '2'.str_pad((string) $tenant->id, 9, '0', STR_PAD_LEFT),
    );
}

function signInAdjustmentUser(Tenant $tenant, User $user): User
{
    test()->actingAs($user);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);

    return $user;
}

function signInAdjustmentManager(Tenant $tenant): User
{
    return signInAdjustmentUser($tenant, adjustmentManager($tenant));
}

/**
 * @return Role The role carrying exactly the given Shield permission names.
 */
function roleWithPermissions(Tenant $tenant, string $roleName, string ...$permissionNames): Role
{
    app(TenantProvisioner::class)->ensurePermissions();

    $role = Role::withoutGlobalScopes()->firstOrCreate(
        ['tenant_id' => $tenant->id, 'name' => $roleName, 'guard_name' => 'web'],
        ['is_system' => false],
    );

    $role->syncPermissions(
        Permission::query()->whereIn('name', $permissionNames)->get()
    );

    return $role;
}

test('a user without adjustment permissions cannot reach the resource', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create();
    $user->tenants()->attach($tenant->id);
    $user->assignRole(roleWithPermissions($tenant, 'service_viewer', 'ViewAny:Service'));

    $this->actingAs($user);

    expect($user->can('ViewAny:EmployeeAdjustment'))->toBeFalse()
        ->and(EmployeeAdjustmentResource::canViewAny())->toBeFalse();
});

test('a tenant owner can reach every adjustments page', function () {
    $tenant = Tenant::factory()->create();
    $employee = adjustmentEmployee($tenant);
    $adjustment = EmployeeAdjustment::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    signInAdjustmentManager($tenant);

    expect(EmployeeAdjustmentResource::canViewAny())->toBeTrue()
        ->and(EmployeeAdjustmentResource::canCreate())->toBeTrue()
        ->and(EmployeeAdjustmentResource::canEdit($adjustment))->toBeTrue()
        ->and(EmployeeAdjustmentResource::canView($adjustment))->toBeTrue();

    $this->get(EmployeeAdjustmentResource::getUrl('index'))->assertOk();
    $this->get(EmployeeAdjustmentResource::getUrl('create'))->assertOk();
    $this->get(EmployeeAdjustmentResource::getUrl('edit', ['record' => $adjustment]))->assertOk();
    $this->get(EmployeeAdjustmentResource::getUrl('view', ['record' => $adjustment]))->assertOk();
});

test('an adjustment records the creator when created from the panel', function () {
    $tenant = Tenant::factory()->create();
    $employee = adjustmentEmployee($tenant);
    $manager = signInAdjustmentManager($tenant);

    Livewire::test(CreateAdjustment::class)
        ->set('data.user_id', $employee->id)
        ->set('data.type', EmployeeAdjustmentTypeEnum::PENALTY->value)
        ->set('data.amount', 150)
        ->set('data.reason', 'Broken appointment')
        ->set('data.effective_date', now()->toDateString())
        ->call('create')
        ->assertHasNoFormErrors();

    $adjustment = EmployeeAdjustment::query()->firstOrFail();

    expect($adjustment->tenant_id)->toBe($tenant->id)
        ->and($adjustment->user_id)->toBe($employee->id)
        ->and($adjustment->type)->toBe(EmployeeAdjustmentTypeEnum::PENALTY)
        ->and((float) $adjustment->amount)->toBe(150.0)
        ->and($adjustment->reason)->toBe('Broken appointment')
        ->and($adjustment->created_by)->toBe($manager->id)
        ->and($adjustment->approved_at)->toBeNull()
        ->and($adjustment->isPending())->toBeTrue()
        ->and(AdjustmentPresenter::statusLabel($adjustment))->toBe(__('core::adjustments.pending_approval'));
});

test('an adjustment type exposes one label per case', function () {
    $labels = collect(EmployeeAdjustmentTypeEnum::cases())
        ->mapWithKeys(fn (EmployeeAdjustmentTypeEnum $type): array => [$type->value => $type->label()])
        ->all();

    expect($labels)->toHaveCount(count(EmployeeAdjustmentTypeEnum::cases()))
        ->and($labels[EmployeeAdjustmentTypeEnum::DISCOUNT->value])->toBe(__('core::adjustments.discount'))
        ->and($labels[EmployeeAdjustmentTypeEnum::PENALTY->value])->toBe(__('core::adjustments.penalty'));
});

test('approving stamps the approver and the approval time', function () {
    $tenant = Tenant::factory()->create();
    $employee = adjustmentEmployee($tenant);
    $manager = signInAdjustmentManager($tenant);

    $adjustment = EmployeeAdjustment::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    expect($adjustment->isPending())->toBeTrue();

    Livewire::test(ListAdjustments::class)
        ->callTableAction('approve', $adjustment);

    $adjustment->refresh();

    expect($adjustment->status)->toBe(EmployeeAdjustmentStatusEnum::APPROVED)
        ->and($adjustment->approved_by)->toBe($manager->id)
        ->and($adjustment->approved_at)->not->toBeNull()
        ->and($adjustment->isPending())->toBeFalse()
        ->and(AdjustmentPresenter::statusLabel($adjustment))->toBe(__('core::adjustments.approved'));
});

test('an approved or cancelled adjustment is not offered the approve action', function () {
    $tenant = Tenant::factory()->create();
    $employee = adjustmentEmployee($tenant);
    signInAdjustmentManager($tenant);

    $approved = EmployeeAdjustment::factory()->approved()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    $cancelled = EmployeeAdjustment::factory()->cancelled()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    Livewire::test(ListAdjustments::class)
        ->assertTableActionHidden('approve', $approved)
        ->assertTableActionHidden('approve', $cancelled);
});

test('approving is denied without the approve permission', function () {
    $tenant = Tenant::factory()->create();
    $employee = adjustmentEmployee($tenant);
    $user = User::factory()->create();
    $user->tenants()->attach($tenant->id);
    $user->assignRole(roleWithPermissions($tenant, 'adjustment_viewer', 'ViewAny:EmployeeAdjustment'));

    $adjustment = EmployeeAdjustment::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    signInAdjustmentUser($tenant, $user);

    expect($user->can('ViewAny:EmployeeAdjustment'))->toBeTrue()
        ->and($user->can('Approve:EmployeeAdjustment'))->toBeFalse();

    Livewire::test(ListAdjustments::class)
        ->assertTableActionHidden('approve', $adjustment);
});

test('tenants only see their own adjustments', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $own = EmployeeAdjustment::factory()->create([
        'tenant_id' => $tenantA->id,
        'user_id' => adjustmentEmployee($tenantA)->id,
    ]);
    $other = EmployeeAdjustment::factory()->create([
        'tenant_id' => $tenantB->id,
        'user_id' => adjustmentEmployee($tenantB)->id,
    ]);

    signInAdjustmentUser($tenantA, adjustmentEmployee($tenantA));

    $ids = EmployeeAdjustment::query()->pluck('id')->all();

    expect($ids)->toContain($own->id)
        ->and($ids)->not->toContain($other->id);
});

test('a branch-bound user only sees employees of their own branch', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $other = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $colleague = adjustmentEmployee($tenant, $mine);
    $stranger = adjustmentEmployee($tenant, $other);
    $branchFree = adjustmentEmployee($tenant);

    $me = User::factory()->create(['is_active' => true, 'branch_id' => $mine->id]);
    $me->tenants()->attach($tenant->id);
    $me->assignRole(roleWithPermissions($tenant, 'hr', 'ViewAny:EmployeeAdjustment'));

    signInAdjustmentUser($tenant, $me);

    $options = EmployeeDirectory::options($tenant);

    // The signed-in user is an employee of their own branch, so they appear too.
    expect(array_keys($options))->toContain($colleague->id, $me->id)
        ->and($options)->not->toHaveKey($stranger->id)
        ->and($options)->not->toHaveKey($branchFree->id)
        ->and($options)->toHaveCount(2);
});

test('a branch-free user falls back to the branch selected in the switcher', function () {
    $tenant = Tenant::factory()->create();
    $downtown = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $oldTown = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $downtownEmployee = adjustmentEmployee($tenant, $downtown);
    $oldTownEmployee = adjustmentEmployee($tenant, $oldTown);

    $owner = adjustmentManager($tenant);
    expect($owner->branch_id)->toBeNull();

    signInAdjustmentUser($tenant, $owner);

    app(BranchContext::class)->set($downtown);

    expect(array_keys(EmployeeDirectory::options($tenant)))->toBe([$downtownEmployee->id]);

    app(BranchContext::class)->set($oldTown);

    expect(array_keys(EmployeeDirectory::options($tenant)))->toBe([$oldTownEmployee->id]);
});

test('a branch-free user with no branch selected sees the whole tenant', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $inBranch = adjustmentEmployee($tenant, $branch);
    $branchFree = adjustmentEmployee($tenant);

    signInAdjustmentUser($tenant, adjustmentManager($tenant));

    expect(EmployeeDirectory::branchIdForCurrentUser())->toBeNull()
        ->and(array_keys(EmployeeDirectory::options($tenant)))
        ->toContain($inBranch->id, $branchFree->id);
});

test('the adjustment list is scoped to the branch of the signed-in user', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $other = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $own = EmployeeAdjustment::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => adjustmentEmployee($tenant, $mine)->id,
    ]);
    $elsewhere = EmployeeAdjustment::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => adjustmentEmployee($tenant, $other)->id,
    ]);

    $me = User::factory()->create(['is_active' => true, 'branch_id' => $mine->id]);
    $me->tenants()->attach($tenant->id);
    $me->assignRole(roleWithPermissions($tenant, 'hr', 'ViewAny:EmployeeAdjustment'));

    signInAdjustmentUser($tenant, $me);

    $ids = EmployeeAdjustmentResource::getEloquentQuery()->pluck('employee_adjustments.id')->all();

    expect($ids)->toBe([$own->id])
        ->and($ids)->not->toContain($elsewhere->id);
});

test('the attendance list is scoped to the branch of the signed-in user', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $other = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $own = EmployeeAttendance::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => adjustmentEmployee($tenant, $mine)->id,
        'branch_id' => $mine->id,
    ]);
    $elsewhere = EmployeeAttendance::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => adjustmentEmployee($tenant, $other)->id,
        'branch_id' => $other->id,
    ]);

    $me = User::factory()->create(['is_active' => true, 'branch_id' => $mine->id]);
    $me->tenants()->attach($tenant->id);
    $me->assignRole(roleWithPermissions($tenant, 'hr', 'ViewAny:EmployeeAttendance'));

    signInAdjustmentUser($tenant, $me);

    $ids = EmployeeAttendanceResource::getEloquentQuery()->pluck('employee_attendances.id')->all();

    expect($ids)->toBe([$own->id])
        ->and($ids)->not->toContain($elsewhere->id);
});
