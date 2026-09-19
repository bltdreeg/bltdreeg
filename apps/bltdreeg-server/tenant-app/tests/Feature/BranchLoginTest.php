<?php

use App\Filament\Auth\Pages\Login;
use Bltdreeg\Core\Models\Branch;
use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Bltdreeg\Core\Support\BranchContext;
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

it('renders the tenant login page with a branch select', function () {
    $this->get('/login')
        ->assertOk()
        ->assertSee('branch_id');
});

it('lets a branch-free user log in with any branch and keeps them branch-free', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create();
    $user->tenants()->attach($tenant);

    Livewire::test(Login::class)
        ->set('data.email', $user->email)
        ->set('data.password', 'password')
        ->set('data.branch_id', $branch->id)
        ->call('authenticate')
        ->assertRedirect('/'.$tenant->slug);

    expect($user->fresh()->branch_id)->toBeNull();
});

it('lets an assigned user log in only with their assigned branch', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['branch_id' => $branch->id]);
    $user->tenants()->attach($tenant);

    Livewire::test(Login::class)
        ->set('data.email', $user->email)
        ->set('data.password', 'password')
        ->set('data.branch_id', $branch->id)
        ->call('authenticate')
        ->assertRedirect('/'.$tenant->slug);

    expect($user->fresh()->branch_id)->toBe($branch->id);
});

it('rejects an assigned user trying to log in with a different branch', function () {
    $tenant = Tenant::factory()->create();
    $assigned = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $other = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['branch_id' => $assigned->id]);
    $user->tenants()->attach($tenant);

    Livewire::test(Login::class)
        ->set('data.email', $user->email)
        ->set('data.password', 'password')
        ->set('data.branch_id', $other->id)
        ->call('authenticate')
        ->assertHasErrors('data.branch_id');

    $this->assertGuest();

    expect($user->fresh()->branch_id)->toBe($assigned->id);
});

it('rejects a branch outside the users tenants at login', function () {
    $tenant = Tenant::factory()->create();
    $otherTenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $otherTenant->id]);
    $user = User::factory()->create();
    $user->tenants()->attach($tenant);

    Livewire::test(Login::class)
        ->set('data.email', $user->email)
        ->set('data.password', 'password')
        ->set('data.branch_id', $branch->id)
        ->call('authenticate')
        ->assertHasErrors('data.branch_id');

    expect($user->fresh()->branch_id)->toBeNull();
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
