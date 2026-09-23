<?php

declare(strict_types=1);

namespace App\Modules\V1\Roles\Filament\Resources\Roles\Pages;

use App\Modules\V1\Roles\Filament\Resources\Roles\RoleResource;
use BezhanSalleh\FilamentShield\Resources\Roles\Pages\ViewRole as ShieldViewRole;

class ViewRole extends ShieldViewRole
{
    protected static string $resource = RoleResource::class;
}
