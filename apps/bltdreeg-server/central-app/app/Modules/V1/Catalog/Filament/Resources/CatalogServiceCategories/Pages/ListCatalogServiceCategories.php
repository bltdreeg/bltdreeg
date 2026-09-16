<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\CatalogServiceCategoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCatalogServiceCategories extends ListRecords
{
    protected static string $resource = CatalogServiceCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
