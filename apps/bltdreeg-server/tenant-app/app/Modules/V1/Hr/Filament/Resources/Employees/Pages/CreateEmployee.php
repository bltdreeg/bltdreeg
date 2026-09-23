<?php

namespace App\Modules\V1\Hr\Filament\Resources\Employees\Pages;

use App\Modules\V1\Hr\Filament\Resources\Employees\EmployeeResource;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class CreateEmployee extends CreateRecord
{
    protected static string $resource = EmployeeResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $tenant = Filament::getTenant();
        $jobTypeId = $data['job_type_id'] ?? null;
        $shiftId = $data['shift_id'] ?? null;
        $roleIds = $data['roles'] ?? [];
        $serviceIds = $data['services'] ?? [];
        unset($data['job_type_id'], $data['shift_id'], $data['roles'], $data['services']);

        if (blank($data['email'] ?? null)) {
            $data['email'] = null;
        }

        $existing = filled($data['email'])
            ? User::query()->where('email', $data['email'])->first()
            : null;

        if ($existing) {
            if ($existing->belongsToTenant($tenant)) {
                throw ValidationException::withMessages([
                    'email' => 'This person already belongs to this tenant.',
                ]);
            }

            $existing->tenants()->attach($tenant->getKey(), ['job_type_id' => $jobTypeId, 'shift_id' => $shiftId]);
            $user = $existing;
        } else {
            $user = User::query()->create($data);
            $user->tenants()->attach($tenant->getKey(), ['job_type_id' => $jobTypeId, 'shift_id' => $shiftId]);
        }

        $user->syncRoles($roleIds);
        $user->services()->sync($serviceIds);

        return $user;
    }
}
