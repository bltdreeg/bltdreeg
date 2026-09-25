<?php

declare(strict_types=1);

use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\LeaveRequestResource;
use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages\CreateLeaveRequest;
use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages\ListLeaveRequests;
use App\Modules\V1\Hr\Support\EmployeeDirectory;
use App\Modules\V1\Hr\Support\LeaveRequestPresenter;
use Bltdreeg\Core\Modules\Auth\Models\Permission;
use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\LeaveRequest;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantProvisioner;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

function leaveEmployee(Tenant $tenant, ?Branch $branch = null): User
{
    $user = User::factory()->create([
        'is_active' => true,
        'branch_id' => $branch?->getKey(),
    ]);

    $user->tenants()->attach($tenant->id);

    return $user;
}

function leaveManager(Tenant $tenant): User
{
    return app(TenantProvisioner::class)->createTenantOwner(
        $tenant,
        'Manager '.$tenant->slug,
        'manager-'.$tenant->slug.'@test.dev',
        'password',
        '2'.str_pad((string) $tenant->id, 9, '0', STR_PAD_LEFT),
    );
}

function signInLeaveUser(Tenant $tenant, User $user): User
{
    test()->actingAs($user);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);

    return $user;
}

/**
 * @return Role The role carrying exactly the given Shield permission names.
 */
function roleWithLeavePermissions(Tenant $tenant, string $roleName, string ...$permissionNames): Role
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

function signInLeaveManager(Tenant $tenant): User
{
    return signInLeaveUser($tenant, leaveManager($tenant));
}

test('a user without leave permissions cannot reach the resource', function () {
    $tenant = Tenant::factory()->create();
    $user = leaveEmployee($tenant);
    $user->assignRole(roleWithLeavePermissions($tenant, 'service_viewer', 'ViewAny:Service'));

    $this->actingAs($user);

    expect($user->can('ViewAny:LeaveRequest'))->toBeFalse()
        ->and(LeaveRequestResource::canViewAny())->toBeFalse();
});

test('a tenant owner can reach every leave request page', function () {
    $tenant = Tenant::factory()->create();
    $leave = LeaveRequest::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => leaveEmployee($tenant)->id,
    ]);

    signInLeaveManager($tenant);

    expect(LeaveRequestResource::canViewAny())->toBeTrue()
        ->and(LeaveRequestResource::canCreate())->toBeTrue()
        ->and(LeaveRequestResource::canEdit($leave))->toBeTrue()
        ->and(LeaveRequestResource::canView($leave))->toBeTrue();

    $this->get(LeaveRequestResource::getUrl('index'))->assertOk();
    $this->get(LeaveRequestResource::getUrl('create'))->assertOk();
    $this->get(LeaveRequestResource::getUrl('edit', ['record' => $leave]))->assertOk();
    $this->get(LeaveRequestResource::getUrl('view', ['record' => $leave]))->assertOk();
});

test('a new request starts pending and records the creator', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $manager = signInLeaveManager($tenant);

    Livewire::test(CreateLeaveRequest::class)
        ->set('data.user_id', $employee->id)
        ->set('data.type', LeaveRequestTypeEnum::SICK->value)
        ->set('data.start_date', now()->addWeek()->toDateString())
        ->set('data.end_date', now()->addWeek()->addDays(2)->toDateString())
        ->set('data.reason', 'Flu')
        ->call('create')
        ->assertHasNoFormErrors();

    $leave = LeaveRequest::query()->firstOrFail();

    expect($leave->tenant_id)->toBe($tenant->id)
        ->and($leave->user_id)->toBe($employee->id)
        ->and($leave->type)->toBe(LeaveRequestTypeEnum::SICK)
        ->and($leave->start_date->toDateString())->toBe(now()->addWeek()->toDateString())
        ->and($leave->end_date->toDateString())->toBe(now()->addWeek()->addDays(2)->toDateString())
        ->and($leave->days())->toBe(3)
        ->and($leave->status)->toBe(LeaveRequestStatusEnum::PENDING)
        ->and($leave->created_by)->toBe($manager->id)
        ->and($leave->approved_at)->toBeNull()
        ->and($leave->isPending())->toBeTrue();
});

test('an end date before the start date is rejected', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    signInLeaveManager($tenant);

    Livewire::test(CreateLeaveRequest::class)
        ->set('data.user_id', $employee->id)
        ->set('data.type', LeaveRequestTypeEnum::VACATION->value)
        ->set('data.start_date', now()->addWeek()->toDateString())
        ->set('data.end_date', now()->subWeek()->toDateString())
        ->call('create')
        ->assertHasFormErrors(['end_date']);

    expect(LeaveRequest::query()->count())->toBe(0);
});

test('a second open request covering the same days is rejected', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    signInLeaveManager($tenant);

    LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
        'start_date' => now()->addMonth()->startOfMonth()->toDateString(),
        'end_date' => now()->addMonth()->startOfMonth()->addDays(4)->toDateString(),
    ]);

    // Overlaps the existing window on its last day.
    Livewire::test(CreateLeaveRequest::class)
        ->set('data.user_id', $employee->id)
        ->set('data.type', LeaveRequestTypeEnum::VACATION->value)
        ->set('data.start_date', now()->addMonth()->startOfMonth()->addDays(3)->toDateString())
        ->set('data.end_date', now()->addMonth()->startOfMonth()->addDays(6)->toDateString())
        ->call('create')
        ->assertHasFormErrors(['end_date']);

    expect(LeaveRequest::query()->count())->toBe(1);
});

test('a cancelled or rejected request does not block a new one', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $start = now()->addMonth()->startOfMonth();

    LeaveRequest::factory()->cancelled()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
        'start_date' => $start->toDateString(),
        'end_date' => $start->addDays(3)->toDateString(),
    ]);

    LeaveRequest::factory()->rejected()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
        'start_date' => $start->toDateString(),
        'end_date' => $start->addDays(3)->toDateString(),
    ]);

    expect(LeaveRequestResource::hasOverlappingRequest($employee->id, $start->toDateString(), $start->addDays(2)->toDateString()))
        ->toBeFalse();
});

test('the overlap check ignores the record being edited', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $start = now()->addMonth()->startOfMonth();

    $leave = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
        'start_date' => $start->toDateString(),
        'end_date' => $start->addDays(3)->toDateString(),
    ]);

    expect(LeaveRequestResource::hasOverlappingRequest($employee->id, $start->toDateString(), $start->addDays(3)->toDateString()))
        ->toBeTrue()
        ->and(LeaveRequestResource::hasOverlappingRequest(
            $employee->id,
            $start->toDateString(),
            $start->addDays(3)->toDateString(),
            $leave,
        ))->toBeFalse();
});

test('approving stamps the approver and the decision time', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $manager = signInLeaveManager($tenant);

    $leave = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    expect($leave->isPending())->toBeTrue();

    Livewire::test(ListLeaveRequests::class)
        ->callTableAction('approve', $leave);

    $leave->refresh();

    expect($leave->status)->toBe(LeaveRequestStatusEnum::APPROVED)
        ->and($leave->approved_by)->toBe($manager->id)
        ->and($leave->approved_at)->not->toBeNull()
        ->and($leave->isPending())->toBeFalse()
        ->and(LeaveRequestPresenter::statusLabel($leave))->toBe(__('core::leave_requests.approved'));
});

test('rejecting records the decision and its author', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $manager = signInLeaveManager($tenant);

    $leave = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    Livewire::test(ListLeaveRequests::class)
        ->callTableAction('reject', $leave);

    $leave->refresh();

    expect($leave->status)->toBe(LeaveRequestStatusEnum::REJECTED)
        ->and($leave->approved_by)->toBe($manager->id)
        ->and($leave->approved_at)->not->toBeNull()
        ->and($leave->isRejected())->toBeTrue();
});

test('a decided request is not offered the approve, reject or cancel actions', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    signInLeaveManager($tenant);

    $approved = LeaveRequest::factory()->approved()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    $rejected = LeaveRequest::factory()->rejected()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    $cancelled = LeaveRequest::factory()->cancelled()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    Livewire::test(ListLeaveRequests::class)
        ->assertTableActionHidden('approve', $approved)
        ->assertTableActionHidden('reject', $rejected)
        ->assertTableActionHidden('cancel', $cancelled)
        ->assertTableActionHidden('cancel', $approved);
});

test('approving and rejecting are denied without the review permissions', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $user = leaveEmployee($tenant);
    // Can see the branch but must not decide anything, which isolates the
    // approve and reject permissions as the only thing under test.
    $user->assignRole(roleWithLeavePermissions(
        $tenant,
        'leave_viewer',
        'ViewAny:LeaveRequest',
        'View:LeaveRequest',
    ));

    $leave = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    signInLeaveUser($tenant, $user);

    expect($user->can('View:LeaveRequest'))->toBeTrue()
        ->and($user->can('Approve:LeaveRequest'))->toBeFalse()
        ->and($user->can('Reject:LeaveRequest'))->toBeFalse();

    Livewire::test(ListLeaveRequests::class)
        ->assertTableActionHidden('approve', $leave)
        ->assertTableActionHidden('reject', $leave);
});

test('an employee may cancel their own pending request', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $employee->assignRole(roleWithLeavePermissions($tenant, 'employee', 'ViewAny:LeaveRequest', 'Create:LeaveRequest'));

    $leave = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    signInLeaveUser($tenant, $employee);

    expect($employee->can('cancel', $leave))->toBeTrue();

    Livewire::test(ListLeaveRequests::class)
        ->callTableAction('cancel', $leave);

    expect($leave->refresh()->status)->toBe(LeaveRequestStatusEnum::CANCELLED);
});

test('an employee cannot cancel somebody else request', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $colleague = leaveEmployee($tenant);
    $employee->assignRole(roleWithLeavePermissions($tenant, 'employee', 'ViewAny:LeaveRequest', 'Create:LeaveRequest'));

    $leave = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $colleague->id,
    ]);

    signInLeaveUser($tenant, $employee);

    expect($employee->can('cancel', $leave))->toBeFalse();
});

test('an employee without the HR view permission only lists their own requests', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $employee = leaveEmployee($tenant, $branch);
    $employee->assignRole(roleWithLeavePermissions($tenant, 'employee', 'ViewAny:LeaveRequest', 'Create:LeaveRequest'));
    $colleague = leaveEmployee($tenant, $branch);

    $mine = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);
    $theirs = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $colleague->id,
    ]);

    signInLeaveUser($tenant, $employee);

    $ids = LeaveRequestResource::getEloquentQuery()->pluck('leave_requests.id')->all();

    expect($ids)->toBe([$mine->id])
        ->and($ids)->not->toContain($theirs->id);
});

test('a branch-bound reviewer only sees their own branch', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $other = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $own = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => leaveEmployee($tenant, $mine)->id,
    ]);
    $elsewhere = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => leaveEmployee($tenant, $other)->id,
    ]);

    $me = leaveEmployee($tenant, $mine);
    $me->assignRole(roleWithLeavePermissions(
        $tenant,
        'hr',
        'ViewAny:LeaveRequest',
        'View:LeaveRequest',
        'Create:LeaveRequest',
        'Update:LeaveRequest',
        'Approve:LeaveRequest',
        'Reject:LeaveRequest',
    ));

    signInLeaveUser($tenant, $me);

    $ids = LeaveRequestResource::getEloquentQuery()->pluck('leave_requests.id')->all();

    expect($ids)->toBe([$own->id])
        ->and($ids)->not->toContain($elsewhere->id);
});

test('a branch-free reviewer falls back to the branch selected in the switcher', function () {
    $tenant = Tenant::factory()->create();
    $downtown = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $oldTown = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $downtownLeave = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => leaveEmployee($tenant, $downtown)->id,
    ]);
    $oldTownLeave = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => leaveEmployee($tenant, $oldTown)->id,
    ]);

    signInLeaveManager($tenant);

    app(BranchContext::class)->set($downtown);

    expect(LeaveRequestResource::getEloquentQuery()->pluck('leave_requests.id')->all())
        ->toBe([$downtownLeave->id]);

    app(BranchContext::class)->set($oldTown);

    expect(LeaveRequestResource::getEloquentQuery()->pluck('leave_requests.id')->all())
        ->toBe([$oldTownLeave->id]);
});

test('the employee picker is limited to the branch of the signed-in user', function () {
    $tenant = Tenant::factory()->create();
    $mine = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $other = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $colleague = leaveEmployee($tenant, $mine);
    $stranger = leaveEmployee($tenant, $other);

    $me = leaveEmployee($tenant, $mine);
    $me->assignRole(roleWithLeavePermissions(
        $tenant,
        'hr',
        'ViewAny:LeaveRequest',
        'View:LeaveRequest',
        'Create:LeaveRequest',
    ));

    signInLeaveUser($tenant, $me);

    $options = EmployeeDirectory::options($tenant);

    expect(array_keys($options))->toContain($colleague->id, $me->id)
        ->and($options)->not->toHaveKey($stranger->id)
        ->and($options)->toHaveCount(2);
});

test('a decided request can no longer be edited', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);
    $manager = signInLeaveManager($tenant);

    $pending = LeaveRequest::factory()->pending()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);
    $approved = LeaveRequest::factory()->approved()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
    ]);

    expect($manager->can('update', $pending))->toBeTrue()
        ->and($manager->can('update', $approved))->toBeFalse()
        ->and(LeaveRequestResource::canEdit($pending))->toBeTrue()
        ->and(LeaveRequestResource::canEdit($approved))->toBeFalse();
});

test('tenants only see their own leave requests', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $own = LeaveRequest::factory()->create([
        'tenant_id' => $tenantA->id,
        'user_id' => leaveEmployee($tenantA)->id,
    ]);
    $foreign = LeaveRequest::factory()->create([
        'tenant_id' => $tenantB->id,
        'user_id' => leaveEmployee($tenantB)->id,
    ]);

    signInLeaveManager($tenantA);

    $ids = LeaveRequestResource::getEloquentQuery()->pluck('leave_requests.id')->all();

    expect($ids)->toBe([$own->id])
        ->and($ids)->not->toContain($foreign->id);
});

test('a leave type exposes one label per case', function () {
    $labels = collect(LeaveRequestTypeEnum::cases())
        ->mapWithKeys(fn (LeaveRequestTypeEnum $type): array => [$type->value => $type->label()])
        ->all();

    expect($labels)->toHaveCount(count(LeaveRequestTypeEnum::cases()))
        ->and($labels[LeaveRequestTypeEnum::PERMISSION->value])->toBe(__('core::leave_requests.permission'))
        ->and($labels[LeaveRequestTypeEnum::SICK->value])->toBe(__('core::leave_requests.sick'))
        ->and($labels[LeaveRequestTypeEnum::VACATION->value])->toBe(__('core::leave_requests.vacation'))
        ->and($labels[LeaveRequestTypeEnum::EMERGENCY->value])->toBe(__('core::leave_requests.emergency'));
});

test('a leave status exposes one label per case', function () {
    $labels = collect(LeaveRequestStatusEnum::cases())
        ->mapWithKeys(fn (LeaveRequestStatusEnum $status): array => [$status->value => $status->label()])
        ->all();

    expect($labels)->toHaveCount(count(LeaveRequestStatusEnum::cases()))
        ->and($labels[LeaveRequestStatusEnum::PENDING->value])->toBe(__('core::leave_requests.pending'))
        ->and($labels[LeaveRequestStatusEnum::APPROVED->value])->toBe(__('core::leave_requests.approved'))
        ->and($labels[LeaveRequestStatusEnum::REJECTED->value])->toBe(__('core::leave_requests.rejected'))
        ->and($labels[LeaveRequestStatusEnum::CANCELLED->value])->toBe(__('core::leave_requests.cancelled'));
});

test('the day count treats a single day leave as one day', function () {
    $tenant = Tenant::factory()->create();
    $employee = leaveEmployee($tenant);

    $single = LeaveRequest::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
        'start_date' => '2026-03-02',
        'end_date' => '2026-03-02',
    ]);

    $week = LeaveRequest::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $employee->id,
        'start_date' => '2026-03-02',
        'end_date' => '2026-03-08',
    ]);

    expect($single->days())->toBe(1)
        ->and($week->days())->toBe(7)
        ->and(LeaveRequestPresenter::days(1))->toBe(trans_choice('core::leave_requests.days', 1, ['count' => 1]))
        ->and(LeaveRequestPresenter::days(5))->toBe(trans_choice('core::leave_requests.days', 5, ['count' => 5]));
});
