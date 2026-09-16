<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\CatalogServiceCategoryResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCatalogServiceCategory extends CreateRecord
{
    protected static string $resource = CatalogServiceCategoryResource::class;
}
