<?php

namespace App\Modules\V1\Settings\Filament\Resources\TeamMembers\Pages;

use App\Modules\V1\Settings\Filament\Resources\TeamMembers\TeamMemberResource;
use App\Modules\V1\Settings\Support\TenantRoles;
use Filament\Resources\Pages\EditRecord;

class EditTeamMember extends EditRecord
{
    protected static string $resource = TeamMemberResource::class;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        TenantRoles::bindTeamContext();

        $data['role'] = $this->getRecord()->roles->pluck('name')->first();

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        unset($data['role']);

        return $data;
    }

    protected function afterSave(): void
    {
        $role = $this->data['role'] ?? null;

        if (! is_string($role) || $role === '') {
            return;
        }

        TenantRoles::bindTeamContext();
        $this->getRecord()->syncRoles([$role]);
    }
}
