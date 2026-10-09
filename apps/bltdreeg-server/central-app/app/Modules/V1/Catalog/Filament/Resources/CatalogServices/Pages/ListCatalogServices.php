<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServices\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\CatalogServiceResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use LaraZeus\SpatieTranslatable\Actions\LocaleSwitcher;
use LaraZeus\SpatieTranslatable\Resources\Pages\ListRecords\Concerns\Translatable;

class ListCatalogServices extends ListRecords
{
    use Translatable;

    protected static string $resource = CatalogServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
            LocaleSwitcher::make(),
        ];
    }
}
