<?php

namespace App\Modules\V1\Hr\Filament\Resources\JobTypes\Pages;

use App\Modules\V1\Hr\Filament\Resources\JobTypes\JobTypeResource;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;

class CreateJobType extends CreateRecord
{
    protected static string $resource = JobTypeResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['tenant_id'] = Filament::getTenant()?->getKey();

        return $data;
    }
}
