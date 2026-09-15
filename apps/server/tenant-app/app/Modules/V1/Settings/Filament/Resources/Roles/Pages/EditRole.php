<?php

namespace App\Modules\V1\Settings\Filament\Resources\Roles\Pages;

use App\Modules\V1\Settings\Filament\Resources\Roles\TenantRoleResource;
use App\Modules\V1\Settings\Support\TenantRoles;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Spatie\Permission\Models\Role;

class EditRole extends EditRecord
{
    protected static string $resource = TenantRoleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (Role $record): bool => ! TenantRoles::isBuiltIn($record)),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        /** @var Role $record */
        $record = $this->getRecord();

        if (TenantRoles::isBuiltIn($record)) {
            return [
                'description' => $record->description,
            ];
        }

        return $data;
    }
}
