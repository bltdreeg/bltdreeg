<?php

declare(strict_types=1);

namespace App\Modules\V1\Roles\Filament\Resources\Roles\Pages;

use App\Modules\V1\Roles\Filament\Resources\Roles\RoleResource;
use BezhanSalleh\FilamentShield\Resources\Roles\Pages\CreateRole as ShieldCreateRole;
use BezhanSalleh\FilamentShield\Support\Utils;
use Override;

class CreateRole extends ShieldCreateRole
{
    protected static string $resource = RoleResource::class;

    #[Override]
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['guard_name'] = Utils::getFilamentAuthGuard() ?: 'web';

        return parent::mutateFormDataBeforeCreate($data);
    }
}
