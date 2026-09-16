<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\CatalogServiceCategoryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCatalogServiceCategory extends EditRecord
{
    protected static string $resource = CatalogServiceCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
