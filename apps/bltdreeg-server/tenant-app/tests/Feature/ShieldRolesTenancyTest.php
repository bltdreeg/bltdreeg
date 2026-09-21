<?php

use BezhanSalleh\FilamentShield\Resources\Roles\RoleResource;
use Bltdreeg\Core\Models\Role;
use Bltdreeg\Core\Models\Tenant;
use Filament\Facades\Filament;
use Illuminate\Contracts\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('shield role queries are scoped to the tenant without a missing relationship', function () {
    $tenant = Tenant::factory()->create();

    Filament::setCurrentPanel('app');
    Filament::bootCurrentPanel();

    $query = RoleResource::scopeEloquentQueryToTenant(Role::query(), $tenant);

    expect($query->toSql())->not->toThrow(QueryException::class)
        ->and((string) $query->toSql())->toContain('where');
});
