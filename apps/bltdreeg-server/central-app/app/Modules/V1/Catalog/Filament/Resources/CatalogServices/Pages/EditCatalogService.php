<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServices\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\CatalogServiceResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCatalogService extends EditRecord
{
    protected static string $resource = CatalogServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
