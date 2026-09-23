<?php

declare(strict_types=1);

namespace App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages;

use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\RoleTemplateResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListRoleTemplates extends ListRecords
{
    protected static string $resource = RoleTemplateResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
