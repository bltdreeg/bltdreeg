<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServices\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\CatalogServiceResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCatalogServices extends ListRecords
{
    protected static string $resource = CatalogServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
