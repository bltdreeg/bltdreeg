<?php

namespace App\Modules\V1\Hr\Filament\Resources\Employees\Pages;

use App\Modules\V1\Hr\Filament\Resources\Employees\EmployeeResource;
use Bltdreeg\Core\Models\User;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

class CreateEmployee extends CreateRecord
{
    protected static string $resource = EmployeeResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $tenant = Filament::getTenant();
        $jobTypeId = $data['job_type_id'] ?? null;
        $roleIds = $data['roles'] ?? [];
        $serviceIds = $data['services'] ?? [];
        unset($data['job_type_id'], $data['roles'], $data['services']);

        $existing = User::query()->where('email', $data['email'])->first();

        if ($existing) {
            if ($existing->belongsToTenant($tenant)) {
                throw ValidationException::withMessages([
                    'email' => 'This person already belongs to this tenant.',
                ]);
            }

            $existing->tenants()->attach($tenant->getKey(), ['job_type_id' => $jobTypeId]);
            $user = $existing;
        } else {
            $user = User::query()->create($data);
            $user->tenants()->attach($tenant->getKey(), ['job_type_id' => $jobTypeId]);
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());
        $user->syncRoles($roleIds);
        $user->services()->sync($serviceIds);

        return $user;
    }
}
