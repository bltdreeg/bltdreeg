<?php

namespace App\Modules\V1\Settings\Filament\Resources\Roles\Pages;

use App\Modules\V1\Settings\Filament\Resources\Roles\TenantRoleResource;
use App\Modules\V1\Settings\Support\TenantRoles;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;

class CreateRole extends CreateRecord
{
    protected static string $resource = TenantRoleResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        TenantRoles::bindTeamContext();

        $data['team_id'] = Filament::getTenant()?->getKey();
        $data['guard_name'] = 'web';
        $data['crm_role'] = false;

        return $data;
    }
}
