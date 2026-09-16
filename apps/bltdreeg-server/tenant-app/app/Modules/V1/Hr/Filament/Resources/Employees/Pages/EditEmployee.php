<?php

namespace App\Modules\V1\Hr\Filament\Resources\Employees\Pages;

use App\Modules\V1\Hr\Filament\Resources\Employees\EmployeeResource;
use Filament\Actions\DeleteAction;
use Filament\Facades\Filament;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\PermissionRegistrar;

class EditEmployee extends EditRecord
{
    protected static string $resource = EmployeeResource::class;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $tenant = Filament::getTenant();
        $membership = $this->record->tenants()->whereKey($tenant->getKey())->first();

        $data['job_type_id'] = $membership?->pivot?->job_type_id;
        $data['roles'] = $this->record->roles->pluck('id')->all();
        $data['services'] = $this->record->services->pluck('id')->all();
        unset($data['password']);

        return $data;
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $tenant = Filament::getTenant();
        $jobTypeId = $data['job_type_id'] ?? null;
        $roleIds = $data['roles'] ?? [];
        $serviceIds = $data['services'] ?? [];
        unset($data['job_type_id'], $data['roles'], $data['services']);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $record->update($data);
        $record->tenants()->updateExistingPivot($tenant->getKey(), ['job_type_id' => $jobTypeId]);

        app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());
        $record->syncRoles($roleIds);
        $record->services()->sync($serviceIds);

        return $record;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->using(function (Model $record): void {
                    $tenant = Filament::getTenant();
                    $record->tenants()->detach($tenant->getKey());
                    $record->services()->detach();

                    if (! $record->is_super_admin && $record->tenants()->doesntExist()) {
                        $record->delete();
                    }
                }),
        ];
    }
}
