<?php

namespace App\Modules\V1\Users\Filament\Resources\Users\Pages;

use App\Modules\V1\Users\Filament\Resources\Users\UserResource;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantProvisioner;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Auth;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        unset($data['password']);

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if ((int) $this->record->getKey() === (int) Auth::id()) {
            $data['is_super_admin'] = true;
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        return $data;
    }

    protected function afterSave(): void
    {
        app(TenantProvisioner::class)->syncSuperAdminAccess($this->record->fresh());
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
