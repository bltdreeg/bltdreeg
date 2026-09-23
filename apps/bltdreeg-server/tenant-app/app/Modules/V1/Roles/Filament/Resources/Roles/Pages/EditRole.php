<?php

declare(strict_types=1);

namespace App\Modules\V1\Roles\Filament\Resources\Roles\Pages;

use App\Modules\V1\Roles\Filament\Resources\Roles\RoleResource;
use BezhanSalleh\FilamentShield\Resources\Roles\Pages\EditRole as ShieldEditRole;
use BezhanSalleh\FilamentShield\Support\Utils;
use Override;

class EditRole extends ShieldEditRole
{
    protected static string $resource = RoleResource::class;

    #[Override]
    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['guard_name'] = Utils::getFilamentAuthGuard() ?: 'web';

        return parent::mutateFormDataBeforeSave($data);
    }
}
