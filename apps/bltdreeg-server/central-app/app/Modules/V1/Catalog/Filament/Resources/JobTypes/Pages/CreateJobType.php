<?php

namespace App\Modules\V1\Catalog\Filament\Resources\JobTypes\Pages;

use App\Modules\V1\Catalog\Filament\Resources\JobTypes\JobTypeResource;
use Filament\Resources\Pages\CreateRecord;

class CreateJobType extends CreateRecord
{
    protected static string $resource = JobTypeResource::class;
}
