<?php

namespace App\Modules\V1\Settings\Filament\Resources\TeamMembers\Pages;

use App\Modules\V1\Settings\Filament\Resources\TeamMembers\TeamMemberResource;
use App\Modules\V1\Settings\Support\TenantRoles;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateTeamMember extends CreateRecord
{
    protected static string $resource = TeamMemberResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        unset($data['role']);

        return $data;
    }

    protected function handleRecordCreation(array $data): Model
    {
        $team = Filament::getTenant();
        abort_unless($team, 403);

        $role = $this->data['role'] ?? null;
        abort_unless(is_string($role) && $role !== '', 422);

        $user = static::getModel()::query()->create($data);

        $team->users()->syncWithoutDetaching([
            $user->getKey() => ['role' => 'member'],
        ]);

        // Members created here otherwise keep a NULL current_team_id, which
        // makes BelongsToTeamsScope fail open (see BindCrmTenant) anywhere
        // that resolves the team from the persisted column instead of the
        // Filament tenant, e.g. the CRM API's SetApiTeamContext fallback.
        $user->forceFill(['current_team_id' => $team->getKey()])->save();

        TenantRoles::bindTeamContext();
        $user->syncRoles([$role]);

        return $user;
    }
}
