<?php

namespace App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages;

use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\RoleTemplateResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditRoleTemplate extends EditRecord
{
    protected static string $resource = RoleTemplateResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
