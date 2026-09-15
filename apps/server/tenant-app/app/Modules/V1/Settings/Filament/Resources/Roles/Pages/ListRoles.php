<?php

namespace App\Modules\V1\Settings\Filament\Resources\Roles\Pages;

use App\Modules\V1\Settings\Filament\Resources\Roles\TenantRoleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListRoles extends ListRecords
{
    protected static string $resource = TenantRoleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
