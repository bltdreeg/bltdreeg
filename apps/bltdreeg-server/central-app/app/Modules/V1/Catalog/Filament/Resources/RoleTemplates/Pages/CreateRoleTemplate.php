<?php

declare(strict_types=1);

namespace App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages;

use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\RoleTemplateResource;
use Filament\Resources\Pages\CreateRecord;

class CreateRoleTemplate extends CreateRecord
{
    protected static string $resource = RoleTemplateResource::class;
}
