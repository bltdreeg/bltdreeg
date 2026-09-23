<?php

use App\Modules\V1\Auth\Filament\Pages\Login;
use App\Modules\V1\Branches\Filament\Pages\SelectBranch;
use App\Modules\V1\Branches\Livewire\BranchSwitcher;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchContext;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchSelection;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

it('a user belongs to a single branch', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['branch_id' => $branch->id]);

    $user->tenants()->attach($tenant);

    expect($user->branch->is($branch))->toBeTrue()
        ->and($branch->users()->find($user->id)->is($user))->toBeTrue();
});

it('branch context scopes branch queries to the selected branch', function () {
    $tenant = Tenant::factory()->create();
    $selected = Branch::factory()->create(['tenant_id' => $tenant->id]);
    Branch::factory()->create(['tenant_id' => $tenant->id]);

    app(BranchContext::class)->set($selected);

    expect(Branch::query()->pluck('id')->all())->toBe([$selected->id]);
});

it('renders the tenant login page without a branch select', function () {
    $this->get('/login')
        ->assertOk()
        ->assertDontSee('name="data.branch_id"', false)
        ->assertDontSee('wire:partial="schema-component::form.branch_id"', false);
});

it('lets a user log in with email and password only and lands on their tenant', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create();
    $user->tenants()->attach($tenant);

    Livewire::test(Login::class)
        ->set('data.email', $user->email)
        ->set('data.password', 'password')
        ->call('authenticate')
        ->assertRedirect('/'.$tenant->slug);
});

it('auto-selects the only allowed branch after login', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['branch_id' => $branch->id]);
    $user->tenants()->attach($tenant);

    $this->actingAs($user)
        ->get('/'.$tenant->slug)
        ->assertOk();

    expect(app(BranchSelection::class)->id())->toBe($branch->id)
        ->and(app(BranchContext::class)->id())->toBe($branch->id)
        ->and($user->fresh()->branch_id)->toBe($branch->id);
});

it('redirects a branch-free user with multiple branches to the select page', function () {
    $tenant = Tenant::factory()->create();
    Branch::factory()->count(2)->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['branch_id' => null]);
    $user->tenants()->attach($tenant);

    $this->actingAs($user)
        ->get('/'.$tenant->slug)
        ->assertRedirect('/'.$tenant->slug.'/select-branch');
});

it('lets a branch-free user pick a branch then enter the dashboard', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['branch_id' => null]);
    $user->tenants()->attach($tenant);

    $this->actingAs($user);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);

    Livewire::test(SelectBranch::class)
        ->set('data.branch_id', $branch->id)
        ->call('select')
        ->assertRedirect('/'.$tenant->slug);

    expect(app(BranchSelection::class)->id())->toBe($branch->id)
        ->and($user->fresh()->branch_id)->toBeNull();
});

it('rejects selecting a branch outside the users allowed set', function () {
    $tenant = Tenant::factory()->create();
    $assigned = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $other = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['branch_id' => $assigned->id]);
    $user->tenants()->attach($tenant);

    $this->actingAs($user);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);

    app(BranchSelection::class)->set($assigned);

    Livewire::test(BranchSwitcher::class)
        ->set('branchId', $other->id);

    expect(app(BranchSelection::class)->id())->toBe($assigned->id)
        ->and($user->fresh()->branch_id)->toBe($assigned->id);
});

it('lets a user switch branch from the top bar without changing their assignment', function () {
    $tenant = Tenant::factory()->create();
    $first = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $second = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['branch_id' => null]);
    $user->tenants()->attach($tenant);

    $this->actingAs($user);
    Filament::setCurrentPanel('app');
    Filament::setTenant($tenant);

    app(BranchSelection::class)->set($first);

    Livewire::test(BranchSwitcher::class)
        ->set('branchId', $second->id);

    expect(app(BranchSelection::class)->id())->toBe($second->id)
        ->and($user->fresh()->branch_id)->toBeNull();
});

it('lets a super admin log in without a branch and lands on their tenant', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->superAdmin()->create();

    Livewire::test(Login::class)
        ->set('data.email', $user->email)
        ->set('data.password', 'password')
        ->call('authenticate')
        ->assertRedirect('/'.$tenant->slug);

    expect($user->fresh()->branch_id)->toBeNull();
});
