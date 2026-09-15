<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Teams\Pages;

use App\Modules\V1\Tenants\Filament\Resources\Teams\TeamResource;
use App\Modules\V1\Tenants\Services\CreateTenant;
use Bltdreeg\Core\Models\User;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateTeam extends CreateRecord
{
    protected static string $resource = TeamResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $owner = User::query()->findOrFail($data['owner_id']);

        return app(CreateTenant::class)->handle(
            $data['name'],
            $data['slug'],
            $owner,
        );
    }
}
