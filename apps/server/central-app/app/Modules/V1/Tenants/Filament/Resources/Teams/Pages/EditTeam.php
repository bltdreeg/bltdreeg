<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Teams\Pages;

use App\Modules\V1\Tenants\Filament\Resources\Teams\TeamResource;
use Filament\Resources\Pages\EditRecord;

class EditTeam extends EditRecord
{
    protected static string $resource = TeamResource::class;
}
