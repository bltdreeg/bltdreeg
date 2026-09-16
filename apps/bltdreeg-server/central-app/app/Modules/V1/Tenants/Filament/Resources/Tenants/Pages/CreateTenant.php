<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Tenants\Pages;

use App\Modules\V1\Tenants\Filament\Resources\Tenants\TenantResource;
use Bltdreeg\Core\Support\TenantProvisioner;
use Filament\Resources\Pages\CreateRecord;

class CreateTenant extends CreateRecord
{
    protected static string $resource = TenantResource::class;

    /**
     * @var array{name: string, email: string, password: string}
     */
    private array $owner = [];

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->owner = [
            'name' => $data['owner_name'],
            'email' => $data['owner_email'],
            'password' => $data['owner_password'],
        ];

        unset($data['owner_name'], $data['owner_email'], $data['owner_password']);

        return $data;
    }

    protected function afterCreate(): void
    {
        app(TenantProvisioner::class)->createTenantOwner(
            $this->record,
            $this->owner['name'],
            $this->owner['email'],
            $this->owner['password'],
        );
    }
}
