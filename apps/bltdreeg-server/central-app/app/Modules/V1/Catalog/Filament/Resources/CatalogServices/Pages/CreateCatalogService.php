<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServices\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\CatalogServiceResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCatalogService extends CreateRecord
{
    protected static string $resource = CatalogServiceResource::class;
}
