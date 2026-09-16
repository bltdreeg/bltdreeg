<?php

namespace App\Modules\V1\Roles\Filament\Resources\Roles\Pages;

use App\Modules\V1\Roles\Filament\Resources\Roles\RoleResource;
use App\Modules\V1\Roles\Services\RoleService;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateRole extends CreateRecord
{
    protected static string $resource = RoleResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['permissions'] = collect($data['permission_groups'] ?? [])
            ->flatten()
            ->filter()
            ->values()
            ->all();
        unset($data['permission_groups']);

        return $data;
    }

    protected function handleRecordCreation(array $data): Model
    {
        return app(RoleService::class)->create($data, Filament::getTenant()->getKey());
    }
}
