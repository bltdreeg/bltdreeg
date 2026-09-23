<?php

namespace App\Modules\V1\Users\Filament\Resources\Users\Pages;

use App\Modules\V1\Users\Filament\Resources\Users\UserResource;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantProvisioner;
use Filament\Resources\Pages\CreateRecord;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected function afterCreate(): void
    {
        app(TenantProvisioner::class)->syncSuperAdminAccess($this->record);
    }
}
